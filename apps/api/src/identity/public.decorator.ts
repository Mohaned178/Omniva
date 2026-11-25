import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export const IS_PUBLIC = Symbol('IS_PUBLIC');

/** Marks the OpenAPI operations reachable without a session, so tests can find every other one. */
export const PUBLIC_OPERATION_EXTENSION = 'x-omniva-public';

/**
 * Lets a visitor without a session use this endpoint. Every other endpoint requires a session
 * (spec, D3): only the public, sign-up, sign-in and recovery endpoints may carry this.
 */
export function Public(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(IS_PUBLIC, true),
    ApiExtension(PUBLIC_OPERATION_EXTENSION, true),
  );
}
