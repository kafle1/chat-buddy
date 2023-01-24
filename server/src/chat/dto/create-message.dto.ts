import { IsString, IsUUID } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  message: string;
  @IsString()
  roomID: string;
  @IsString()
  userID: string;
}

export class SendMessageBody {
  @IsUUID()
  roomId: string;
  @IsString()
  text: string;
}
