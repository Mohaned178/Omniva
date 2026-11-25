import { Controller, Get, Header, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorSchema, CurrentSessionSchema, type CurrentSession } from '@omniva/schemas';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import type { SignedInUser } from './authentication.js';
import { CurrentSessionView } from './current-session-view.js';
import { CurrentUser } from './current-user.decorator.js';

@ApiTags('auth')
@Controller('session')
export class SessionController {
  constructor(private readonly currentSessionView: CurrentSessionView) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    operationId: 'getCurrentSession',
    summary: 'Who is signed in, and their personal workspace',
  })
  @ApiZodResponse({ status: HttpStatus.OK, description: 'Signed in', schema: CurrentSessionSchema })
  @ApiZodResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No valid session',
    schema: ApiErrorSchema,
  })
  async getCurrentSession(@CurrentUser() user: SignedInUser): Promise<CurrentSession> {
    return this.currentSessionView.forUser(user);
  }
}
