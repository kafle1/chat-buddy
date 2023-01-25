import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto, UpdateMessageBody } from './dto/update-message.dto';
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

    if (!room) throw new BadRequestException('Room does not exist');

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

    if (!user) throw new BadRequestException('User is not in room');

    //create new  chat
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

  async find(chatId: string) {
    return await this.prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
        userID: true,
        roomID: true,
      },
    });
  }

  async update(updateMessageDto: UpdateMessageDto) {
    //check if message exists
    const message = await this.prisma.chat.findUnique({
      where: {
        id: updateMessageDto.messageID,
      },
    });

    if (!message) throw new BadRequestException('Message does not exist');

    //check if user is the owner of the message
    if (message.userID !== updateMessageDto.userID)
      throw new BadRequestException('User is not the owner of the message');

    //update the message
    return await this.prisma.chat.update({
      where: {
        id: updateMessageDto.messageID,
      },
      data: {
        message: updateMessageDto.message,
      },
      select: {
        id: true,
        message: true,
        updatedAt: true,
        userID: true,
        roomID: true,
      },
    });
  }

  async remove(id: string, userID: string) {
    //check if message exists
    const message = await this.prisma.chat.findUnique({
      where: {
        id,
      },
    });

    if (!message) throw new WsException('Message does not exist');

    //check if user is the owner of the message
    if (message.userID !== userID)
      throw new WsException('User is not the owner of the message');

    //delete the message
    return await this.prisma.chat.delete({
      where: {
        id,
      },
    });
  }
}
