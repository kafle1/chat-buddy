import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

@WebSocketGateway(6000, {
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      const id = socket.handshake.query.id;
      socket.join(id);
      console.log(`Client of id ${socket.id} connected`);
    });
    instrument(this.server, {
      auth: false,
    });
  }

  @SubscribeMessage('sendMessage')
  handleNewMessage(
    @MessageBody() { recipients, text }: { recipients: string[]; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const id = client.handshake.query.id as string;

    recipients.forEach((recipient) => {
      const newRecipients = recipients.filter((r) => r !== recipient);
      newRecipients.push(id);
      client.broadcast.to(recipient).emit('receiveMessage', {
        recipients: newRecipients,
        sender: id,
        text,
      });
    });
  }
}
