import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class CreateMessageDto {
  @IsString()
  message: string;
  @IsString()
  roomID: string;
  @IsString()
  userID: string;
}

export class SendMessageBody {
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Room ID',
    description: 'The ID of the room to send the message to',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  roomId: string;
  @ApiProperty({
    example: 'Hello World',
    title: 'Message Text',
    description: 'The text of the message to send',
    type: 'string',
  })
  @IsString()
  text: string;
}

export class ReceiveMessageBody {
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Message ID',
    description: 'The ID of the created message',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Room ID',
    description: 'The ID of the room the message was sent to',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  roomId: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Sender ID',
    description: 'The ID of the user who sent the message',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  sender: string;
  @ApiProperty({
    example: 'Hello World',
    title: 'Message Text',
    description: 'The message text',
    type: 'string',
    required: false,
  })
  @IsString()
  text: string;
  @ApiProperty({
    example: '2021-01-01T00:00:00.000Z',
    title: 'Created At',
    description: 'The date and time when message was created',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsString()
  createdAt: string;
}

export class HeaderToken {
  @ApiProperty({
    example: 'eyJhb',
    title: 'JWT Token',
    description: 'The JWT token to authenticate the user',
    type: 'object',
  })
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
