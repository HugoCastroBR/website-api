import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
export class JwtAuthGuard extends AuthGuard('jwt') {
  // canActivate(context: ExecutionContext) {
  //   return super.canActivate(context);
  // }
  // handleRequest(err, user, info) {
  //   console.log(err, user, info);
  //   if (err || !user) {
  //     throw err || new Error('User not authenticated');
  //   }
  //   return user;
  // }
}
