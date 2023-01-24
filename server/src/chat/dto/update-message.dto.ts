import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsString, IsUUID } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  message: string;

  @IsString()
  @IsUUID()
  userID: string;

  @IsString()
  @IsUUID()
  messageID: string;
}
