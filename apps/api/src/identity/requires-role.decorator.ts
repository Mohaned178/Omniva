import { applyDecorators, HttpStatus, SetMetadata } from '@nestjs/common';
import { ApiExtension, ApiParam } from '@nestjs/swagger';
import { ApiErrorSchema, type MemberRole } from '@omniva/schemas';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';

export const MINIMUM_ROLE = Symbol('MINIMUM_ROLE');

/** The path parameter every endpoint inside a workspace names it with. */
export const WORKSPACE_ID_PARAM = 'workspaceId';

/** Marks each workspace endpoint's minimum role, so tests can find and check every one. */
export const MINIMUM_ROLE_EXTENSION = 'x-omniva-minimum-role';

/**
 * Puts the endpoint behind the workspace gate (spec, D3; ADR 0009): only a member of the
 * workspace its path names, with at least this role, gets through.
 */
export function RequiresRole(minimum: MemberRole): MethodDecorator {
  return applyDecorators(
    SetMetadata(MINIMUM_ROLE, minimum),
    ApiExtension(MINIMUM_ROLE_EXTENSION, minimum),
    ApiParam({ name: WORKSPACE_ID_PARAM, type: String }),
    ApiZodResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'The workspace does not exist, or the user is not a member of it',
      schema: ApiErrorSchema,
    }),
    // Every member is at least a Viewer, so only a higher minimum can refuse a member.
    ...(minimum === 'viewer'
      ? []
      : [
          ApiZodResponse({
            status: HttpStatus.FORBIDDEN,
            description: 'The user’s role in the workspace does not allow this',
            schema: ApiErrorSchema,
          }),
        ]),
  );
}
