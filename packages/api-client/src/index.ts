import createClient, { type Client } from 'openapi-fetch';
import type { paths } from './generated/openapi.js';

export type { components, paths } from './generated/openapi.js';

export type ApiClient = Client<paths>;

/** A typed client for the Omniva /v1 API, generated from the API's OpenAPI document. */
export function createApiClient(baseUrl: string): ApiClient {
  return createClient<paths>({ baseUrl });
}
