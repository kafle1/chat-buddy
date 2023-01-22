import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDTO } from './dtos/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: string, updateUserDTO: UpdateUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    this.prisma.user.update({
      where: {
        id,
      },
      data: updateUserDTO,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return {
      message: 'User updated successfully',
    };
  }


  async delete (id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    this.prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
