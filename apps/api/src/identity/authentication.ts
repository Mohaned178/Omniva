import { Injectable } from '@nestjs/common';
import type { SignInRequest, SignUpRequest } from '@omniva/schemas';
import { isAPIError } from 'better-auth/api';
import { AppConfig } from '../platform/config/app-config.js';
import { DatabaseClient } from '../platform/database/database-client.js';
import { PersonalWorkspaces } from '../workspaces/personal-workspaces.js';
import { type AuthEngine, createAuthEngine } from './auth-engine.js';
import {
  EmailNotVerified,
  InvalidCredentials,
  InvalidVerificationToken,
} from './identity-errors.js';
import { VerificationEmails } from './verification-email/verification-emails.js';

/** Set-Cookie headers to pass on to the browser unchanged. */
export type SessionCookies = readonly string[];

export interface SignedInUser {
  readonly userId: string;
  readonly email: string;
}

export interface SessionLookup {
  readonly user: SignedInUser | undefined;
  /** A lookup can renew the session, which refreshes its cookie. */
  readonly cookies: SessionCookies;
}

/** Better Auth requires a name at sign-up; Omniva asks for none. */
const NO_NAME = '';

/**
 * Identity & Access: who someone is and whether they are signed in. Better Auth does the
 * work; this class is the only code that knows it is there.
 */
@Injectable()
export class Authentication {
  private readonly engine: AuthEngine;

  constructor(
    config: AppConfig,
    database: DatabaseClient,
    personalWorkspaces: PersonalWorkspaces,
    verificationEmails: VerificationEmails,
  ) {
    this.engine = createAuthEngine({
      config,
      database,
      sendVerificationEmail: (email, token) => verificationEmails.request(email, token),
      provisionPersonalWorkspace: (userId) => personalWorkspaces.provisionFor(userId),
    });
  }

  /**
   * Creates the user and sends them a verification link. Signing up with an address that is
   * already registered looks exactly the same, so nobody can find out who uses Omniva.
   */
  async signUp({ email, password }: SignUpRequest, headers: Headers): Promise<void> {
    await this.engine.api.signUpEmail({ body: { email, password, name: NO_NAME }, headers });
  }

  /** Confirms the address from the emailed link and signs the user in. */
  async verifyEmail(token: string, headers: Headers): Promise<SessionCookies> {
    try {
      const result = await this.engine.api.verifyEmail({
        query: { token },
        headers,
        returnHeaders: true,
      });
      return result.headers.getSetCookie();
    } catch (error) {
      if (isAPIError(error)) throw new InvalidVerificationToken('The link is invalid or expired.');
      throw error;
    }
  }

  async signIn({ email, password }: SignInRequest, headers: Headers): Promise<SessionCookies> {
    try {
      const result = await this.engine.api.signInEmail({
        body: { email, password },
        headers,
        returnHeaders: true,
      });
      return result.headers.getSetCookie();
    } catch (error) {
      if (!isAPIError(error)) throw error;
      if (error.body?.code === 'EMAIL_NOT_VERIFIED') {
        throw new EmailNotVerified('Verify the email address first; a new link has been sent.');
      }
      throw new InvalidCredentials('The email address or password is not right.');
    }
  }

  async signOut(headers: Headers): Promise<SessionCookies> {
    const result = await this.engine.api.signOut({ headers, returnHeaders: true });
    return result.headers.getSetCookie();
  }

  /** The signed-in user the request's session cookie belongs to, if it is valid. */
  async lookUpSession(headers: Headers): Promise<SessionLookup> {
    const result = await this.engine.api.getSession({ headers, returnHeaders: true });
    const cookies = result.headers.getSetCookie();
    if (!result.response) return { user: undefined, cookies };
    const { user } = result.response;
    return { user: { userId: user.id, email: user.email }, cookies };
  }
}
