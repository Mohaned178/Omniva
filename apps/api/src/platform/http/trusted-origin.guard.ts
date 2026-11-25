import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AppConfig } from '../config/app-config.js';
import { DomainError } from './domain-error.js';

/** Reading never changes anything, so only these methods may come from anywhere. */
const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);

export class UntrustedOrigin extends DomainError {
  readonly kind = 'forbidden';
  readonly code = 'UNTRUSTED_ORIGIN';
}

/**
 * Cross-site request forgery protection for every /v1 endpoint: a request that changes
 * anything must come from the Omniva web app. Browsers always send Origin on such requests
 * and pages on other sites cannot forge it; the session cookie's SameSite=Lax is the second
 * layer.
 */
@Injectable()
export class TrustedOriginGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;
    if (request.headers.origin === this.config.webOrigin) return true;
    throw new UntrustedOrigin('Requests that change data must come from the Omniva web app.');
  }
}
