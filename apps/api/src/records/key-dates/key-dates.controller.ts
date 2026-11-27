import { Controller, Get, Header, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeyDateAttentionListSchema, type KeyDateAttentionList } from '@omniva/schemas';
import { CurrentWorkspace } from '../../identity/current-workspace.decorator.js';
import { RequiresRole } from '../../identity/requires-role.decorator.js';
import type { WorkspaceAccess } from '../../identity/workspace-access.js';
import { ApiZodResponse } from '../../platform/http/api-zod-response.js';
import { KeyDateAttention } from './key-date-attention.js';

/** Key dates in a workspace. */
@ApiTags('key-dates')
@Controller('workspaces/:workspaceId/key-dates')
export class KeyDatesController {
  constructor(private readonly attention: KeyDateAttention) {}

  @Get('attention')
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({
    operationId: 'getKeyDateAttention',
    summary: 'The Key dates coming up and the ones marked missing',
  })
  @ApiZodResponse({
    status: HttpStatus.OK,
    description: 'The attention list',
    schema: KeyDateAttentionListSchema,
  })
  async getKeyDateAttention(
    @CurrentWorkspace() access: WorkspaceAccess,
  ): Promise<KeyDateAttentionList> {
    return this.attention.list(access);
  }
}
