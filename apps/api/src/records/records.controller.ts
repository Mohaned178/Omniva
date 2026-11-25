import { Controller, Get, Header, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorSchema,
  CreateRecordRequestSchema,
  LifeModuleSchema,
  RecordListQuerySchema,
  RecordHistorySchema,
  RecordIdSchema,
  RecordListSchema,
  RecordSchema,
  UpdateRecordRequestSchema,
  type CreateRecordRequest,
  type RecordHistory,
  type RecordList,
  type RecordListQuery,
  type RecordView,
  type UpdateRecordRequest,
} from '@omniva/schemas';
import { CurrentWorkspace } from '../identity/current-workspace.decorator.js';
import { RequiresRole } from '../identity/requires-role.decorator.js';
import type { WorkspaceAccess } from '../identity/workspace-access.js';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { ApiZodBody, ZodBody } from '../platform/http/zod-body.js';
import { zodComponentRef } from '../platform/http/zod-openapi-components.js';
import { ZodQuery } from '../platform/http/zod-query.js';
import { RecordChanges } from './record-changes.js';
import { RecordLibrary } from './record-library.js';

const INVALID_INPUT_RESPONSE = {
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid input, such as a field the Type does not have',
  schema: ApiErrorSchema,
} as const;

/** The path parameter naming one record. */
const RECORD_ID_PARAM = 'recordId';

const RECORD_NOT_FOUND_RESPONSE = {
  status: HttpStatus.NOT_FOUND,
  description: 'No such record in the workspace',
  schema: ApiErrorSchema,
} as const;

/** Documents the record id in the path by its shared schema. */
function ApiRecordIdParam(): MethodDecorator {
  return ApiParam({
    name: RECORD_ID_PARAM,
    // ApiParam takes no bare $ref; a one-item allOf points at the shared schema all the same.
    schema: { allOf: [{ $ref: zodComponentRef(RecordIdSchema) }] },
  });
}

/** Records in a workspace: creating, finding and changing them. */
@ApiTags('records')
@Controller('workspaces/:workspaceId/records')
export class RecordsController {
  constructor(
    private readonly changes: RecordChanges,
    private readonly library: RecordLibrary,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresRole('editor')
  @ApiOperation({
    operationId: 'createRecord',
    summary: 'Create a record of a Type, in the Type’s home module',
  })
  @ApiZodBody(CreateRecordRequestSchema)
  @ApiZodResponse({ status: HttpStatus.CREATED, description: 'The record', schema: RecordSchema })
  @ApiZodResponse(INVALID_INPUT_RESPONSE)
  async createRecord(
    @CurrentWorkspace() access: WorkspaceAccess,
    @ZodBody(CreateRecordRequestSchema) body: CreateRecordRequest,
  ): Promise<RecordView> {
    return this.changes.create(access, body);
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({
    operationId: 'listRecords',
    summary: 'The records whose home is a module, in use or archived',
  })
  @ApiQuery({
    name: 'module',
    required: true,
    schema: { allOf: [{ $ref: zodComponentRef(LifeModuleSchema) }] },
  })
  @ApiQuery({ name: 'archived', required: false, schema: { type: 'boolean', default: false } })
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The records', schema: RecordListSchema })
  @ApiZodResponse(INVALID_INPUT_RESPONSE)
  async listRecords(
    @CurrentWorkspace() access: WorkspaceAccess,
    @ZodQuery(RecordListQuerySchema) query: RecordListQuery,
  ): Promise<RecordList> {
    return { records: [...(await this.library.list(access, query))] };
  }

  @Get(`:${RECORD_ID_PARAM}`)
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({ operationId: 'getRecord', summary: 'One record with its anatomy and fields' })
  @ApiRecordIdParam()
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The record', schema: RecordSchema })
  @ApiZodResponse(RECORD_NOT_FOUND_RESPONSE)
  async getRecord(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
  ): Promise<RecordView> {
    return this.library.get(access, recordId);
  }

  @Patch(`:${RECORD_ID_PARAM}`)
  @RequiresRole('editor')
  @ApiOperation({
    operationId: 'updateRecord',
    summary: 'Change a record’s title or fields; given fields replace the old ones',
  })
  @ApiRecordIdParam()
  @ApiZodBody(UpdateRecordRequestSchema)
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The record', schema: RecordSchema })
  @ApiZodResponse(INVALID_INPUT_RESPONSE)
  @ApiZodResponse(RECORD_NOT_FOUND_RESPONSE)
  async updateRecord(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
    @ZodBody(UpdateRecordRequestSchema) body: UpdateRecordRequest,
  ): Promise<RecordView> {
    return this.changes.update(access, recordId, body);
  }

  @Get(`:${RECORD_ID_PARAM}/history`)
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({
    operationId: 'getRecordHistory',
    summary: 'A record’s own changes on the Activity Timeline, oldest first',
  })
  @ApiRecordIdParam()
  @ApiZodResponse({
    status: HttpStatus.OK,
    description: 'The record’s history',
    schema: RecordHistorySchema,
  })
  @ApiZodResponse(RECORD_NOT_FOUND_RESPONSE)
  async getRecordHistory(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
  ): Promise<RecordHistory> {
    return this.library.history(access, recordId);
  }

  @Post(`:${RECORD_ID_PARAM}/archive`)
  @HttpCode(HttpStatus.OK)
  @RequiresRole('editor')
  @ApiOperation({
    operationId: 'archiveRecord',
    summary: 'Put a record away, keeping its fields, links and history',
  })
  @ApiRecordIdParam()
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The record', schema: RecordSchema })
  @ApiZodResponse(RECORD_NOT_FOUND_RESPONSE)
  async archiveRecord(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
  ): Promise<RecordView> {
    return this.changes.archive(access, recordId);
  }

  @Post(`:${RECORD_ID_PARAM}/unarchive`)
  @HttpCode(HttpStatus.OK)
  @RequiresRole('editor')
  @ApiOperation({
    operationId: 'unarchiveRecord',
    summary: 'Bring an archived record back into use',
  })
  @ApiRecordIdParam()
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The record', schema: RecordSchema })
  @ApiZodResponse(RECORD_NOT_FOUND_RESPONSE)
  async unarchiveRecord(
    @CurrentWorkspace() access: WorkspaceAccess,
    @Param(RECORD_ID_PARAM) recordId: string,
  ): Promise<RecordView> {
    return this.changes.unarchive(access, recordId);
  }
}
