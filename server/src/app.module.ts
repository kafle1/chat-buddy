import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [AuthModule, UserModule, RoomModule],
  controllers: [],
  providers: [AppService, ChatGateway, PrismaService],
})
export class AppModule {}
