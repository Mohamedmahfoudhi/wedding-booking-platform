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
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("./messages.service");
let MessagesGateway = class MessagesGateway {
    constructor(messagesService) {
        this.messagesService = messagesService;
        this.userSockets = new Map();
    }
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(client.id);
            this.userSockets.set(userId, sockets);
        }
    }
    handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const sockets = this.userSockets.get(userId) || [];
            const filtered = sockets.filter((id) => id !== client.id);
            if (filtered.length > 0) {
                this.userSockets.set(userId, filtered);
            }
            else {
                this.userSockets.delete(userId);
            }
        }
    }
    handleJoinConversation(client, data) {
        client.join(`conversation:${data.conversationId}`);
    }
    handleLeaveConversation(client, data) {
        client.leave(`conversation:${data.conversationId}`);
    }
    async handleSendMessage(client, data) {
        const message = await this.messagesService.sendMessage(data.conversationId, data.senderId, data.content, data.attachmentUrl);
        this.server
            .to(`conversation:${data.conversationId}`)
            .emit('new_message', message);
        return message;
    }
    handleTyping(client, data) {
        client.to(`conversation:${data.conversationId}`).emit('user_typing', {
            userId: data.userId,
        });
    }
    handleStopTyping(client, data) {
        client.to(`conversation:${data.conversationId}`).emit('user_stopped_typing', {
            userId: data.userId,
        });
    }
    async handleMarkRead(client, data) {
        await this.messagesService.markAsRead(data.conversationId, data.userId);
        this.server
            .to(`conversation:${data.conversationId}`)
            .emit('messages_read', { userId: data.userId });
    }
    notifyUser(userId, event, data) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
    broadcastNewMessage(conversationId, message) {
        this.server.to(`conversation:${conversationId}`).emit('new_message', message);
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleStopTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkRead", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map