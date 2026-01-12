import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageResponseDto } from './dto/message-response.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const token: string = client.handshake.auth.token;
    if (!token) throw new UnauthorizedException('No token provided');
    const isVerified = await this.jwtService.verifyAsync(token);
    if (!isVerified) throw new UnauthorizedException('Invalid token provided');
    await client.join(data.conversationId);
    console.log(
      `Client ${client.id} joined conversation ${data.conversationId}`,
    );
    return { event: 'joined', conversationId: data.conversationId };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(data.conversationId);
    console.log(`Client ${client.id} left conversation ${data.conversationId}`);
    return { event: 'left', conversationId: data.conversationId };
  }

  sendMessage(conversationId: string, message: MessageResponseDto) {
    this.server.to(conversationId).emit('newMessage', message);
  }

  updateMessage(conversationId: string, message: MessageResponseDto) {
    this.server.to(conversationId).emit('updateMessage', message);
  }

  deleteMessage(conversationId: string, message: MessageResponseDto) {
    this.server.to(conversationId).emit('deleteMessage', message);
  }

  markAsRead(conversationId: string, messages: MessageResponseDto[]) {
    this.server.to(conversationId).emit('markAsReadMessage', messages);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: { conversationId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client Disconnected:', client.id);
  }

  handleConnection(client: Socket) {
    console.log('Client Connected:', client.id);
  }
}
