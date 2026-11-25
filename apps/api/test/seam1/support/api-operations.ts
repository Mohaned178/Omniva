import type { OpenAPIObject } from '@nestjs/swagger';
import type { MemberRole } from '@omniva/schemas';
import { PUBLIC_OPERATION_EXTENSION } from '../../../src/identity/public.decorator.js';
import { MINIMUM_ROLE_EXTENSION } from '../../../src/identity/requires-role.decorator.js';

const HTTP_METHODS = ['get', 'put', 'post', 'patch', 'delete'] as const;

export interface ApiOperation {
  readonly method: (typeof HTTP_METHODS)[number];
  readonly path: string;
  readonly operationId: string;
  readonly isPublic: boolean;
  /** Set on every endpoint behind the workspace gate. */
  readonly minimumRole: MemberRole | undefined;
}

/** Every operation in the API's OpenAPI document, so a new endpoint is covered automatically. */
export function apiOperations(document: OpenAPIObject): readonly ApiOperation[] {
  return Object.entries(document.paths).flatMap(([path, item]) =>
    HTTP_METHODS.flatMap((method) => {
      const operation = item[method];
      if (!operation) return [];
      return [
        {
          method,
          path,
          operationId: operation.operationId ?? `${method} ${path}`,
          isPublic: Reflect.get(operation, PUBLIC_OPERATION_EXTENSION) === true,
          minimumRole: Reflect.get(operation, MINIMUM_ROLE_EXTENSION) as MemberRole | undefined,
        },
      ];
    }),
  );
}
