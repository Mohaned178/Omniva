import { Controller, Get, Header, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TypeListSchema, type TypeList } from '@omniva/schemas';
import { RequiresRole } from '../identity/requires-role.decorator.js';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { TypeCatalog } from './type-catalog.js';

/**
 * The Types a workspace can create records of. Named by workspace because custom Types will
 * be the workspace's own data (ADR 0011); for now every workspace has the built-in ones.
 */
@ApiTags('records')
@Controller('workspaces/:workspaceId/types')
export class TypesController {
  constructor(private readonly types: TypeCatalog) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @RequiresRole('viewer')
  @ApiOperation({ operationId: 'listTypes', summary: 'The Types records can be created from' })
  @ApiZodResponse({ status: HttpStatus.OK, description: 'The Types', schema: TypeListSchema })
  listTypes(): TypeList {
    return { types: [...this.types.all()] };
  }
}
