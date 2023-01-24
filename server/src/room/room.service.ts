import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}
  async create(createRoomDto: CreateRoomDto, id: string) {
    const user = this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    //create new room
    const newRoom = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        creator: {
          connect: {
            id,
          },
        },
      },
    });

    //link the new room with RoomUser table
    await this.prisma.roomUser.create({
      data: {
        user: {
          connect: {
            id,
          },
        },
        room: {
          connect: {
            id: newRoom.id,
          },
        },
      },
    });

    return {
      message: 'Room created successfully',
      room: newRoom,
    };
  }

  async findAll() {
    return await this.prisma.room.findMany({
      include: {
        creator: {
          select: {
            id: true,
          },
        },
        roomUsers: {
          select: {
            userID: true,
            roomID: true,
          },
        },
        _count: true,
      },
    });
  }

  async findOne(id: string) {
    //check if room exists
    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    const roomDetails = await this.prisma.room.findUnique({
      where: {
        id,
      },
      include: {
        roomUsers: {
          where: {
            roomID: id,
          },
          select: {
            userID: true,
          },
        },
        chats: {
          select: {
            id: true,
            message: true,
            createdAt: true,
            userID: true,
          },
        },
      },
    });

    return {
      ...roomDetails,
      roomUsers: roomDetails.roomUsers.map((user) => user.userID),
    };
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    //check if room exists
    const room = this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    return await this.prisma.room.update({
      where: {
        id,
      },
      data: {
        name: updateRoomDto.name,
      },
    });
  }

  async remove(id: string) {
    //check if room exists
    const room = await this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    //allow deletion only if the user is the creator of the room
    if (room.creatorID !== id)
      throw new NotFoundException(
        `User of id ${id} is not the creator of the room of id ${id}. Only creator can delete the room`,
      );

    await this.prisma.room.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Room deleted successfully',
    };
  }

  async joinRoom(roomId: string, userId: string) {
    //check if room exists
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    //check if user is already in the room
    const roomUser = await this.prisma.roomUser.findFirst({
      where: {
        userID: userId,
        roomID: roomId,
      },
    });

    if (roomUser)
      throw new NotFoundException(
        `User of id ${userId} already in room of id ${roomId}`,
      );

    //link the new room with RoomUser table
    await this.prisma.roomUser.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        room: {
          connect: {
            id: roomId,
          },
        },
      },
    });

    return {
      message: `User of id ${userId} joined room of id ${roomId} successfully`,
    };
  }

  async leaveRoom(roomId: string, userId: string) {
    //check if room exists
    const room = await this.prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    //check if user is already in the room
    const roomUser = await this.prisma.roomUser.findFirst({
      where: {
        userID: userId,
        roomID: roomId,
      },
    });

    if (!roomUser)
      throw new NotFoundException(
        `User of id ${userId} not in room of id ${roomId}`,
      );

    //check if user is the creator of the room
    if (room.creatorID === userId)
      throw new NotFoundException(
        `User of id ${userId} is the creator of the room of id ${roomId}. Creator can't leave the room`,
      );

    //unlink the room with RoomUser table
    await this.prisma.roomUser.delete({
      where: {
        id: roomUser.id,
      },
    });

    return {
      message: `User of id ${userId} left room of id ${roomId} successfully`,
    };
  }
}
