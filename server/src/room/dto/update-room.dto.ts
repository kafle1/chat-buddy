import { IsString } from 'class-validator';
export class UpdateRoomDto {
  @IsString()
  name: string;
}
