import { UseFilters } from '@nestjs/common';
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
import { ChatService } from './chat.service';
import {
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common/exceptions';

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
    private chatService: ChatService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    instrument(this.server, {
      auth: false,
    });
  }
  user: { id: string; rooms?: string[] };

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
        //get roomID of the user whose id matches with userID in RoomUser table
        select: {
          id: true,
          roomUsers: {
            where: {
              userID: id,
            },
            select: {
              roomID: true,
            },
          },
        },
      });

      if (!user) {
        client.disconnect();
        throw new WsException('User not found');
      }

      this.user = {
        id: user.id,
        rooms: [...user.roomUsers.map((room) => room.roomID)],
      };

      //join all rooms
      this.joinRoom(client);

      //set online status to true
      client.emit('online', { id: user.id, online: true });
    } catch (error) {
      client.disconnect();
      throw new WsException(error.message);
    }
  }

  handleDisconnect(client: Socket) {
    //set online status to false
    client.emit('online', { id: this.user.id, online: false });
  }

  @SubscribeMessage('sendMessage')
  async handleNewMessage(
    @MessageBody()
    { roomId, text }: { roomId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    //check if user is in room
    if (client.rooms.has(roomId)) {
      // //create new chat message
      // await this.chatService.create({
      //   message: text,
      //   roomID: roomId,
      //   userID: this.user.id,
      // });

      //send message to all users in room
      client.broadcast.to(roomId).emit('receiveMessage', {
        roomId,
        sender: this.user.id,
        text,
      });
    }
  }

  joinRoom(client: Socket) {
    client.join([this.user.id, this.user.rooms.map((room) => room).join('')]);

    console.log(
      `Client of id ${client.id} connected, joined room ${
        this.user.id
      }, ${this.user.rooms.map((room) => room).join('')} `,
    );
  }
}
