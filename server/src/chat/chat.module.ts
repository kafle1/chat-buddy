import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { RoomModule } from 'src/room/room.module';
import { ChatService } from './chat.service';

@Module({
  imports: [AuthModule, RoomModule],
  providers: [ChatGateway, PrismaService, ChatService],
})
export class ChatModule {}
