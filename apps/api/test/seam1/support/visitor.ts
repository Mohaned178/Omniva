import { randomUUID } from 'node:crypto';
import { createApiClient, type ApiClient } from '@omniva/api-client';

export interface RawRequest {
  /** Values for the path's `{name}` placeholders. */
  readonly params?: Readonly<Record<string, string>>;
  readonly body?: unknown;
}

/**
 * Someone using Omniva from the web app, as a browser would: their cookies are kept between
 * requests and every request carries the web app's Origin header.
 */
export class Visitor {
  readonly api: ApiClient;
  private readonly cookies = new Map<string, string>();
  private lastSetCookies: readonly string[] = [];

  constructor(
    private readonly apiUrl: string,
    private origin: string,
  ) {
    this.api = createApiClient(apiUrl, { fetch: (request) => this.send(request) });
  }

  /** From now on the browser is on another site, still holding its Omniva cookies. */
  browseTo(origin: string): void {
    this.origin = origin;
  }

  /**
   * Calls any API path without the typed client. Path parameters come from `params`, and any
   * left out get ids that exist nowhere; the JSON body is `body`, or empty where the method
   * takes one.
   */
  async raw(method: string, path: string, request: RawRequest = {}): Promise<Response> {
    const filledPath = path.replace(
      /\{([^}]+)\}/g,
      (_placeholder, name: string) => request.params?.[name] ?? randomUUID(),
    );
    const hasBody = method.toLowerCase() !== 'get';
    return this.send(
      new Request(new URL(filledPath, this.apiUrl), {
        method: method.toUpperCase(),
        headers: { 'Content-Type': 'application/json' },
        ...(hasBody && { body: JSON.stringify(request.body ?? {}) }),
      }),
    );
  }

  /** The raw Set-Cookie headers of the most recent response that set any. */
  get setCookieHeaders(): readonly string[] {
    return this.lastSetCookies;
  }

  get hasCookies(): boolean {
    return this.cookies.size > 0;
  }

  private async send(request: Request): Promise<Response> {
    const headers = new Headers(request.headers);
    headers.set('Origin', this.origin);
    if (this.cookies.size > 0) headers.set('Cookie', this.cookieHeader());

    const response = await fetch(new Request(request, { headers }));
    this.keepCookies(response.headers.getSetCookie());
    return response;
  }

  private cookieHeader(): string {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; ');
  }

  private keepCookies(setCookies: readonly string[]): void {
    if (setCookies.length === 0) return;
    this.lastSetCookies = setCookies;
    for (const header of setCookies) {
      const [pair = '', ...attributes] = header.split(';');
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      const isRemoval =
        value === '' || attributes.some((attribute) => /^\s*max-age=0\s*$/i.test(attribute));
      if (isRemoval) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }
}
