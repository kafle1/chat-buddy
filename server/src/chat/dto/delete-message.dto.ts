import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class DeleteMessageBody {
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Room ID',
    description: 'The ID of the room to delete the message from',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  roomId: string;
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Message ID',
    description: 'The ID of the message to delete',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  messageId: string;
}

export class ReceiveDeleteMessageBody {
  @ApiProperty({
    example: 'e0b9b9a0-9c0b-4e2e-9c54-6f8b2a95fde6',
    title: 'Message ID',
    description: 'The ID of the deleted message',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  id: string;
}
