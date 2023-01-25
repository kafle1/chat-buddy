import {
  ReceiveUpdateMessageBody,
  UpdateMessageBody,
} from './dto/update-message.dto';
import { UseFilters, BadRequestException, Logger } from '@nestjs/common';
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
import { JWT_SECRET } from 'src/config/env.config';
import { ChatService } from './chat.service';
import { WebsocketExceptionsFilter } from 'src/utils/ws.exception-filter';
import { AsyncApiPub, AsyncApiService, AsyncApiSub } from 'nestjs-asyncapi';
import {
  HeaderToken,
  ReceiveMessageBody,
  SendMessageBody,
} from './dto/create-message.dto';
import {
  DeleteMessageBody,
  ReceiveDeleteMessageBody,
} from './dto/delete-message.dto';
@AsyncApiService()
@UseFilters(WebsocketExceptionsFilter)
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
    private logger: Logger,
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
        this.logger.error(
          `Client with connection id: ${client.id} disconnected: No token provided`,
        );
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
        this.logger.error(
          `Client with connection id: ${client.id} disconnected: User does not exist`,
        );
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
      this.logger.error(
        `Client with connection id: ${client.id} disconnected: ${error.message}`,
      );
    }
  }

  async handleDisconnect(client: Socket) {
    //set online status to false
    client.emit('online', { id: this.user.id, online: false });

    console.log(`Client with connection id: ${client.id} disconnected`);
  }

  @SubscribeMessage('sendMessage')
  @AsyncApiSub({
    channel: 'sendMessage',
    description: 'Create new message',
    message: {
      name: 'sendMessage',
      payload: {
        type: SendMessageBody,
      },
      headers: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token',
          },
        },
      },
    },
  })
  @AsyncApiPub({
    channel: 'receiveMessage',
    description: 'Receive new message',
    message: {
      name: 'receiveMessage',
      payload: {
        type: ReceiveMessageBody,
      },
    },
  })
  async handleNewMessage(
    @MessageBody()
    { roomId, text }: SendMessageBody,
    @ConnectedSocket() client: Socket,
  ) {
    //create new chat message
    const newMessage = await this.chatService.create({
      message: text,
      roomID: roomId,
      userID: this.user.id,
    });

    const chat = await this.chatService.find(newMessage.id);

    //send message to all users in room
    client.broadcast.to(roomId).emit('receiveMessage', {
      id: chat.id,
      roomId: chat.roomID,
      sender: chat.userID,
      text: chat.message,
      createdAt: chat.createdAt,
    });
  }

  @SubscribeMessage('updateMessage')
  @AsyncApiSub({
    channel: 'updateMessage',
    description: 'Update message',
    message: {
      name: 'updateMessage',
      payload: {
        type: UpdateMessageBody,
      },
      headers: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token',
          },
        },
      },
    },
  })
  @AsyncApiPub({
    channel: 'receiveUpdateMessage',
    description: 'Receive updated message',
    message: {
      name: 'receiveUpdateMessage',
      payload: {
        type: ReceiveUpdateMessageBody,
      },
    },
  })
  async handleUpdateMessage(
    @MessageBody()
    { roomId, messageId, text }: UpdateMessageBody,
    @ConnectedSocket() client: Socket,
  ) {
    //update chat message
    const updatedMessage = await this.chatService.update({
      message: text,
      messageID: messageId,
      userID: this.user.id,
    });

    //send message to all users in room
    client.broadcast.to(roomId).emit('receiveUpdateMessage', {
      id: updatedMessage.id,
      roomId: updatedMessage.roomID,
      sender: updatedMessage.userID,
      text: updatedMessage.message,
      updatedAt: updatedMessage.updatedAt,
    });
  }

  @SubscribeMessage('deleteMessage')
  @AsyncApiSub({
    channel: 'deleteMessage',
    description: 'Delete message',
    message: {
      name: 'deleteMessage',
      payload: {
        type: DeleteMessageBody,
      },
      headers: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token',
          },
        },
      },
    },
  })
  @AsyncApiPub({
    channel: 'receiveDeleteMessage',
    description: 'Receive deleted message',
    message: {
      name: 'receiveDeleteMessage',
      payload: {
        type: ReceiveDeleteMessageBody,
      },
    },
  })
  async handleDeleteMessage(
    @MessageBody()
    { roomId, messageId }: DeleteMessageBody,
    @ConnectedSocket() client: Socket,
  ) {
    //delete chat message
    await this.chatService.remove(messageId, this.user.id);

    //send message to all users in room
    client.broadcast.to(roomId).emit('receiveDeleteMessage', {
      id: messageId,
    });
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
