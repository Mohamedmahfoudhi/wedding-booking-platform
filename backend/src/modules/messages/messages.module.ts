import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Conversation } from '../../database/entities/conversation.entity';
import { Message } from '../../database/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
