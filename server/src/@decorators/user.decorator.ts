import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();

    const { id = null } = (user as { id: string }) || {};

    return data ? user && user[data] : id;
  },
);
