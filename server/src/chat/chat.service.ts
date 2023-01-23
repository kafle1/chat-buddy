import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WsException } from '@nestjs/websockets/errors';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createMessageDto: CreateMessageDto) {
    //check if room exists
    const room = await this.prisma.room.findUnique({
      where: {
        id: createMessageDto.roomID,
      },
    });

    if (!room) throw new WsException('Room does not exist');

    //check if user is in room
    const user = await this.prisma.roomUser.findFirst({
      where: {
        AND: [
          {
            roomID: createMessageDto.roomID,
          },
          {
            userID: createMessageDto.userID,
          },
        ],
      },
    });

    if (!user) throw new WsException('User is not in room');

    const chat = await this.prisma.chat.create({
      data: {
        message: createMessageDto.message,
        room: {
          connect: {
            id: createMessageDto.roomID,
          },
        },
        user: {
          connect: {
            id: createMessageDto.userID,
          },
        },
      },
    });

    return chat;
  }

  async findAll(roomID: string) {
    //get all the chat messages with the room id
    return await this.prisma.chat.findMany({
      where: {
        roomID,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
