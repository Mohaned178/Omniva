import { Controller, Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthReportSchema, type HealthReport } from '@omniva/schemas';
import type { Response } from 'express';
import { ApiZodResponse } from '../platform/http/api-zod-response.js';
import { HealthCheck } from './health-check.js';

/** Public and content-free, so uptime monitors and the health page can read it. */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheck: HealthCheck) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ operationId: 'getHealth', summary: 'Health of every Omniva component' })
  @ApiZodResponse({
    status: HttpStatus.OK,
    description: 'Omniva works: status is ok, or degraded while Redis is down',
    schema: HealthReportSchema,
  })
  @ApiZodResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'A component Omniva cannot work without is down',
    schema: HealthReportSchema,
  })
  async getHealth(@Res({ passthrough: true }) response: Response): Promise<HealthReport> {
    const report = await this.healthCheck.run();
    response.status(report.status === 'down' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK);
    return report;
  }
}
