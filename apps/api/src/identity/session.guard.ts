import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { Authentication } from './authentication.js';
import { SessionRequired } from './identity-errors.js';
import { IS_PUBLIC } from './public.decorator.js';
import { requestHeaders, type SignedInRequest } from './signed-in-request.js';

/** Every endpoint requires a session unless it is marked @Public() (spec, D3). */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authentication: Authentication,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<SignedInRequest>();
    const { user, cookies } = await this.authentication.lookUpSession(requestHeaders(request));
    if (!user) throw new SessionRequired('Sign in to use this.');

    if (cookies.length > 0) http.getResponse<Response>().append('Set-Cookie', [...cookies]);
    request.signedInUser = user;
    return true;
  }
}
