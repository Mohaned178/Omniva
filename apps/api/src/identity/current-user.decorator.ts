import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { SignedInUser } from './authentication.js';
import { SessionRequired } from './identity-errors.js';
import type { SignedInRequest } from './signed-in-request.js';

/** The user whose session the session guard accepted. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SignedInUser => {
    const { signedInUser } = context.switchToHttp().getRequest<SignedInRequest>();
    if (!signedInUser) throw new SessionRequired('Sign in to use this.');
    return signedInUser;
  },
);
