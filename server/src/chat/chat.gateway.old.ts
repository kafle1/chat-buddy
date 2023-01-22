import { OnModuleInit } from '@nestjs/common';
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
import { instrument } from '@socket.io/admin-ui';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from 'src/room/room.service';

@WebSocketGateway(6000, {
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private roomService: RoomService,
    private prisma: PrismaService,
  ) {}

  handleDisconnect(client: Socket) {
    console.log({ client });
    // throw new Error('Method not implemented.');
  }
  handleConnection(client: Socket, ...args: any[]) {
    console.log({ client, args });
    // throw new Error('Method not implemented.');
  }

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
