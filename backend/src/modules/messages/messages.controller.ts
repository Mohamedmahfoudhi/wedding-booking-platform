import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';

@ApiTags('messages')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my conversations' })
  async getConversations(@CurrentUser() user: User) {
    const isProvider = user.role === UserRole.PROVIDER;
    const conversations = await this.messagesService.getConversations(
      user.id,
      isProvider,
    );
    return { conversations };
  }

  @Post()
  @ApiOperation({ summary: 'Start a new conversation' })
  async startConversation(
    @CurrentUser() user: User,
    @Body() body: { providerId: string; serviceId?: string },
  ) {
    const conversation = await this.messagesService.findOrCreateConversation(
      user.id,
      body.providerId,
      body.serviceId,
    );
    return { conversation };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@CurrentUser() user: User) {
    const isProvider = user.role === UserRole.PROVIDER;
    const count = await this.messagesService.getUnreadCount(user.id, isProvider);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details' })
  async getConversation(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const conversation = await this.messagesService.getConversation(id, user.id);
    return { conversation };
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const { messages, total } = await this.messagesService.getMessages(
      id,
      user.id,
      page,
      limit,
    );

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

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { content: string; attachmentUrl?: string },
  ) {
    const message = await this.messagesService.sendMessage(
      id,
      user.id,
      body.content,
      body.attachmentUrl,
    );
    return { message };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark messages as read' })
  async markAsRead(@CurrentUser() user: User, @Param('id') id: string) {
    await this.messagesService.markAsRead(id, user.id);
    return { message: 'Marked as read' };
  }
}
