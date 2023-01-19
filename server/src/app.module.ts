import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AppService, ChatGateway, PrismaService],
})
export class AppModule {}
