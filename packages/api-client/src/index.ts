import createClient, { type Client, type ClientOptions } from 'openapi-fetch';
import type { paths } from './generated/openapi.js';

export type { components, paths } from './generated/openapi.js';

export type ApiClient = Client<paths>;

export interface ApiClientOptions {
  /** Replaces the global fetch, for example with one that keeps a test's cookies. */
  readonly fetch?: ClientOptions['fetch'];
}

/**
 * A typed client for the Omniva /v1 API, generated from the API's OpenAPI document. It sends
 * the session cookie with every request, since the web app and the API are different origins
 * on one site.
 */
export function createApiClient(baseUrl: string, options: ApiClientOptions = {}): ApiClient {
  return createClient<paths>({
    baseUrl,
    credentials: 'include',
    ...(options.fetch && { fetch: options.fetch }),
  });
}
