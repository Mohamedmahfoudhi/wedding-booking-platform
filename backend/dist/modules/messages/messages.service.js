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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("../../database/entities/conversation.entity");
const message_entity_1 = require("../../database/entities/message.entity");
let MessagesService = class MessagesService {
    constructor(conversationRepository, messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }
    async findOrCreateConversation(clientId, providerId, serviceId) {
        let conversation = await this.conversationRepository.findOne({
            where: { clientId, providerId },
        });
        if (!conversation) {
            conversation = this.conversationRepository.create({
                clientId,
                providerId,
                serviceId,
            });
            await this.conversationRepository.save(conversation);
        }
        return conversation;
    }
    async getConversations(userId, isProvider) {
        const query = this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.client', 'client')
            .leftJoinAndSelect('conversation.provider', 'provider')
            .leftJoinAndSelect('provider.user', 'providerUser')
            .leftJoinAndSelect('conversation.service', 'service')
            .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST');
        if (isProvider) {
            query.where('provider.user_id = :userId', { userId });
        }
        else {
            query.where('conversation.client_id = :userId', { userId });
        }
        return query.getMany();
    }
    async getConversation(conversationId, userId) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['client', 'provider', 'provider.user', 'service'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        if (conversation.clientId !== userId && conversation.provider.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return conversation;
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        await this.getConversation(conversationId, userId);
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { conversationId },
            relations: ['sender'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { messages: messages.reverse(), total };
    }
    async sendMessage(conversationId, senderId, content, attachmentUrl) {
        await this.getConversation(conversationId, senderId);
        const created = this.messageRepository.create({
            conversationId,
            senderId,
            content,
            attachmentUrl,
        });
        const saved = await this.messageRepository.save(created);
        await this.conversationRepository.update(conversationId, {
            lastMessageAt: new Date(),
        });
        return this.messageRepository.findOne({
            where: { id: saved.id },
            relations: ['sender'],
        });
    }
    async markAsRead(conversationId, userId) {
        await this.getConversation(conversationId, userId);
        await this.messageRepository
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ isRead: true, readAt: new Date() })
            .where('conversation_id = :conversationId', { conversationId })
            .andWhere('sender_id != :userId', { userId })
            .andWhere('is_read = false')
            .execute();
    }
    async getUnreadCount(userId, isProvider) {
        const query = this.messageRepository
            .createQueryBuilder('message')
            .leftJoin('message.conversation', 'conversation')
            .leftJoin('conversation.provider', 'provider')
            .where('message.isRead = :isRead', { isRead: false })
            .andWhere('message.senderId != :userId', { userId });
        if (isProvider) {
            query.andWhere('provider.userId = :userId', { userId });
        }
        else {
            query.andWhere('conversation.clientId = :userId', { userId });
        }
        return query.getCount();
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map