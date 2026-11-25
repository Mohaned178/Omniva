import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import type { SignedInUser } from './authentication.js';

/** A request the session guard has let through, carrying who is signed in. */
export interface SignedInRequest extends Request {
  signedInUser?: SignedInUser;
}

/** The request's headers in the Fetch API form Better Auth reads. */
export function requestHeaders(request: Request): Headers {
  return fromNodeHeaders(request.headers);
}
