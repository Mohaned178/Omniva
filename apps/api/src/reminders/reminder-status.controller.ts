import { Controller, HttpStatus, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorSchema,
  FieldKeySchema,
  RecordIdSchema,
  ReminderStatusSchema,
  SetReminderStatusRequestSchema,
  type ReminderStatus,
  type SetReminderStatusRequest,
} from '@omniva/schemas';
import { CurrentWorkspace } from '../identity/current-workspace.decorator.js';
import { RequiresRole } from '../identity/requires-role.decorator.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { ApiSchemaParam } from '../platform/http/api-schema-param.js';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { ApiZodBody, ZodBody } from '../platform/http/zod-body.js';
import { ReminderStatuses } from './reminder-statuses.js';

const RECORD_ID_PARAM = 'recordId';
const FIELD_KEY_PARAM = 'fieldKey';

/** What a member does about the reminder of one of a record's Key dates. */
@ApiTags('key-dates')
@Controller(`workspaces/:workspaceId/records/:${RECORD_ID_PARAM}/key-dates/:${FIELD_KEY_PARAM}`)
export class ReminderStatusController {
  constructor(private readonly statuses: ReminderStatuses) {}

  @Put('reminder')
  @RequiresRole('editor')
  @ApiOperation({
    operationId: 'setReminderStatus',
    summary: 'Mark a Key date’s reminder handled, snooze it until a day ahead, or open it again',
  })
  @ApiSchemaParam(RECORD_ID_PARAM, RecordIdSchema)
  @ApiSchemaParam(FIELD_KEY_PARAM, FieldKeySchema)
  @ApiZodBody(SetReminderStatusRequestSchema)
  @ApiZodResponse({
    status: HttpStatus.OK,
    description: 'Where the reminder now stands',
    schema: ReminderStatusSchema,
  })
  @ApiZodResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input, such as a snooze that does not end after today',
    schema: ApiErrorSchema,
  })
  @ApiZodResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The record has no such Key date on that day, or there is no such record',
    schema: ApiErrorSchema,
  })
  async setReminderStatus(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
    @Param(FIELD_KEY_PARAM) fieldKey: string,
    @ZodBody(SetReminderStatusRequestSchema) body: SetReminderStatusRequest,
  ): Promise<ReminderStatus> {
    return this.statuses.set(access, { recordId, fieldKey }, body);
  }
}
