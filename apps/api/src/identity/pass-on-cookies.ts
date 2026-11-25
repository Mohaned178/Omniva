import type { Response } from 'express';
import type { SessionCookies } from './authentication.js';

/** Hands the session cookies Better Auth set on to the browser, unchanged. */
export function passOnCookies(cookies: SessionCookies, response: Response): void {
  if (cookies.length > 0) response.append('Set-Cookie', [...cookies]);
}
