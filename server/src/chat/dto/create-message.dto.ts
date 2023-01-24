import { IsString } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  message: string;
  @IsString()
  roomID: string;
  @IsString()
  userID: string;
}
