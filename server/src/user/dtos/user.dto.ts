import { IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @MaxLength(20)
  name: string;
}
