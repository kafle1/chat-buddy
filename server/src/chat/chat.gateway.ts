import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoomService } from 'src/room/room.service';
import { User } from '@prisma/client';
import { JWT_SECRET } from 'src/config/env.config';

@WebSocketGateway(6000, {
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private roomService: RoomService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    instrument(this.server, {
      auth: false,
    });
  }

  async handleConnection(client: Socket) {
    try {
      //check if token is provided
      if (!client.handshake.query.token) {
        client.disconnect();
        throw new WsException('Token not provided');
      }

      //check if token is valid
      const token = client.handshake.query.token as string;
      const { id } = this.jwtService.verify(token, {
        secret: JWT_SECRET,
      }) as { id: string };

      // check if user exists
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        client.disconnect();
        throw new WsException('User not found');
      }

      client.join(client.id);
      console.log(`Client of id ${client.id} connected`);
    } catch (error) {
      console.log({ error });
      client.disconnect();
      throw new WsException(error.message);
    }
  }

  handleDisconnect(client: Socket) {
    console.log({ client });
    // throw new Error('Method not implemented.');
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
