"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const messages_service_1 = require("./messages.service");
const messages_gateway_1 = require("./messages.gateway");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let MessagesController = class MessagesController {
    constructor(messagesService, messagesGateway) {
        this.messagesService = messagesService;
        this.messagesGateway = messagesGateway;
    }
    async getConversations(user) {
        const isProvider = user.role === user_entity_1.UserRole.PROVIDER;
        const conversations = await this.messagesService.getConversations(user.id, isProvider);
        return { conversations };
    }
    async startConversation(user, body) {
        const conversation = await this.messagesService.findOrCreateConversation(user.id, body.providerId, body.serviceId);
        return { conversation };
    }
    async getUnreadCount(user) {
        const isProvider = user.role === user_entity_1.UserRole.PROVIDER;
        const count = await this.messagesService.getUnreadCount(user.id, isProvider);
        return { count };
    }
    async getConversation(user, id) {
        const conversation = await this.messagesService.getConversation(id, user.id);
        return { conversation };
    }
    async getMessages(user, id, page = 1, limit = 50) {
        const { messages, total } = await this.messagesService.getMessages(id, user.id, page, limit);
        return {
            messages,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async sendMessage(user, id, body) {
        const message = await this.messagesService.sendMessage(id, user.id, body.content, body.attachmentUrl);
        this.messagesGateway.broadcastNewMessage(id, message);
        return { message };
    }
    async markAsRead(user, id) {
        await this.messagesService.markAsRead(id, user.id);
        return { message: 'Marked as read' };
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my conversations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new conversation' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "startConversation", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread message count' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation messages' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark messages as read' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markAsRead", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('messages'),
    (0, common_1.Controller)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        messages_gateway_1.MessagesGateway])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map