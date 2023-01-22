import { PrismaService } from './../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/config/env.config';
import * as argon from 'argon2';
import { LoginDTO, SignupDTO } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  //sign token
  async signToken(id: string) {
    const payload = {
      id,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '120m',
      secret: JWT_SECRET,
    });

    return {
      message: 'Login successful',
      access_token: token,
    };
  }

  //signup user
  async signup(signupInput: SignupDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: signupInput.email,
      },
    });

    if (user) throw new UnauthorizedException('User already exists');

    const password = await argon.hash(signupInput.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: signupInput.email,
        password,
        name: signupInput.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return {
      message: 'User created successfully',
      user: newUser,
    };
  }

  //login user
  async login(loginInput: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginInput.email,
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const passwordMatch = await argon.verify(
      user.password,
      loginInput.password,
    );

    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id);
  }
}
