import { IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;
}
