import { Controller, Get, Header, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorSchema, WorkspaceSchema, type Workspace } from '@omniva/schemas';
import { CurrentWorkspace } from '../identity/current-workspace.decorator.js';
import { RequiresRole } from '../identity/requires-role.decorator.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { WorkspaceView } from './workspace-view.js';

@ApiTags('workspaces')
@Controller('workspaces/:workspaceId')
export class WorkspacesController {
  constructor(private readonly workspaceView: WorkspaceView) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({
    operationId: 'getWorkspace',
    summary: 'A workspace the user is a member of, with their role in it',
  })
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The workspace', schema: WorkspaceSchema })
  @ApiZodResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No valid session',
    schema: ApiErrorSchema,
  })
  async getWorkspace(@CurrentWorkspace() access: WorkspaceAccess): Promise<Workspace> {
    return this.workspaceView.forMember(access);
  }
}
