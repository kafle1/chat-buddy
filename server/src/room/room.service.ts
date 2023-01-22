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
    return await this.prisma.room.findUnique({
      where: {
        id,
      },
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
    const room = this.prisma.room.findUnique({
      where: {
        id,
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    await this.prisma.room.delete({
      where: {
        id,
      },
    });
    
    return {
      message: 'Room deleted successfully',
    };
  }
}
