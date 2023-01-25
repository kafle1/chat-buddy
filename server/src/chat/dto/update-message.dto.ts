import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

export class UpdateMessageBody {
  @ApiProperty({
    example: 'Hello World',
    title: 'Message Text',
    description: 'The text of the message to update with',
    type: 'string',
  })
  @IsString()
  text: string;

  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Room ID',
    description: 'The ID of the room to update the message to',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  roomId: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Message ID',
    description: 'The ID of the message to update',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  messageId: string;
}

// id: updatedMessage.id,
// roomId: updatedMessage.roomID,
// sender: updatedMessage.userID,
// text: updatedMessage.message,
// createdAt: updatedMessage.createdAt,
export class ReceiveUpdateMessageBody {
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Message ID',
    description: 'The ID of the updated message',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  id: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Room ID',
    description: 'The ID of the room the message was updated in',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  roomId: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Sender ID',
    description: 'The ID of the user who sent the updated message',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  sender: string;
  @ApiProperty({
    example: 'Hello World',
    title: 'Message Text',
    description: 'The text of the message to update ',
    type: 'string',
    required: false,
  })
  @IsString()
  text: string;
  @ApiProperty({
    example: '2020-10-10T10:10:10.000Z',
    title: 'Updated At',
    description: 'The date the message was updated',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsString()
  updatedAt: string;
}
