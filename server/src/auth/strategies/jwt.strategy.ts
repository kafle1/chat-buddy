import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from 'src/config/env.config';
import { PrismaService } from 'src/prisma/prisma.service';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // console.log(payload);

    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     id: payload.id,
    //   },
    // });

    // console.log(user);

    // if (!user) {
    //   throw new UnauthorizedException('Unauthorized');
    // }

    return payload;
  }
}
