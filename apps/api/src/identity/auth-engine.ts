import { Logger } from '@nestjs/common';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@omniva/schemas';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { AppConfig } from '../platform/config/app-config.js';
import type { DatabaseClient } from '../platform/database/database-client.js';

/** A verification link stays usable for a day, so it survives a slow inbox. */
const VERIFICATION_LINK_LIFETIME_SECONDS = 24 * 60 * 60;
const COOKIE_PREFIX = 'omniva';

export interface AuthEngineDependencies {
  readonly config: AppConfig;
  readonly database: DatabaseClient;
  /** Queues the verification email for an address, with the token its link carries. */
  readonly sendVerificationEmail: (email: string, token: string) => Promise<void>;
  /** Makes sure a user has their personal workspace; safe to call more than once. */
  readonly provisionPersonalWorkspace: (userId: string) => Promise<void>;
}

/**
 * Better Auth, configured for Omniva (spec, D3; ADR 0016): email and password only, a
 * verified email before any session, sessions in PostgreSQL behind secure HTTP-only cookies
 * shared by the web app and API subdomains.
 */
export function createAuthEngine(dependencies: AuthEngineDependencies) {
  const { config, database } = dependencies;
  const logger = new Logger('BetterAuth');

  return betterAuth({
    appName: 'Omniva',
    baseURL: config.apiPublicUrl,
    secret: config.authSecret,
    trustedOrigins: [config.webOrigin],
    database: prismaAdapter(database, { provider: 'postgresql', transaction: true }),
    // Better Auth's "account" is a sign-in method; Omniva keeps "Account" for financial
    // accounts only (GLOSSARY.md).
    account: { modelName: 'userCredential' },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
    },
    emailVerification: {
      sendOnSignUp: true,
      // Trying to sign in unverified sends a fresh link, so a lost email never strands anyone.
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: VERIFICATION_LINK_LIFETIME_SECONDS,
      sendVerificationEmail: ({ user, token }) =>
        dependencies.sendVerificationEmail(user.email, token),
      // Repeats provisioning in case the attempt at sign-up failed after the user was saved,
      // so nobody is ever signed in without a personal workspace.
      afterEmailVerification: (user) => dependencies.provisionPersonalWorkspace(user.id),
    },
    databaseHooks: {
      user: {
        create: { after: (user) => dependencies.provisionPersonalWorkspace(user.id) },
      },
    },
    advanced: {
      cookiePrefix: COOKIE_PREFIX,
      useSecureCookies: new URL(config.apiPublicUrl).protocol === 'https:',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
      ...(config.cookieDomain && {
        crossSubDomainCookies: { enabled: true, domain: config.cookieDomain },
      }),
    },
    // Omniva's rate limits come with account security and use Redis (spec, D3).
    rateLimit: { enabled: false },
    telemetry: { enabled: false },
    // Better Auth's messages can quote email addresses, so only errors are logged and only
    // their message, never their arguments (CODING_STANDARDS §7).
    logger: {
      level: 'error',
      log: (_level, message) => {
        logger.error(message);
      },
    },
  });
}

export type AuthEngine = ReturnType<typeof createAuthEngine>;
