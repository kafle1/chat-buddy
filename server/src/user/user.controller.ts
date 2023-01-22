import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dtos/user.dto';
import { JwtAuthGuard } from 'src/@guards/jwt.guards';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return this.userService.update(id, updateUserDTO);
  }
}
