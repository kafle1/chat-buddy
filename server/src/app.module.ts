import { JwtService } from '@nestjs/jwt';
import { Module, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { RoomService } from './room/room.service';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [AuthModule, UserModule, RoomModule],
  controllers: [],
  providers: [
    AppService,
    ChatGateway,
    PrismaService,
    JwtService,
    RoomService,
    ChatService,
    Logger
  ],
})
export class AppModule {}
