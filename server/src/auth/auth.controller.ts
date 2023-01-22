import { PrismaService } from 'src/prisma/prisma.service';
import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { LoginDTO, SignupDTO } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginInput: LoginDTO) {
    return this.authService.login(loginInput);
  }

  @Post('signup')
  async signup(@Body() signupInput: SignupDTO) {
    return this.authService.signup(signupInput);
  }

}
