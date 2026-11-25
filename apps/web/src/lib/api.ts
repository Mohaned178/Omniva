import { createApiClient } from '@omniva/api-client';

/** Inlined at build time; set per environment (apps/web/.env.development locally). */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (API_URL === undefined) {
  throw new Error('NEXT_PUBLIC_API_URL must be set to the Omniva API address');
}

/** The browser's only route to app data (ADR 0019). */
export const api = createApiClient(API_URL);
