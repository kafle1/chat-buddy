import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Client of id ${socket.id} connected`);
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('onMessage', {
      id: client.id,
      data: body,
    });
  }
}
