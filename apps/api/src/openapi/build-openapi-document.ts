import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { withZodComponents } from '../platform/http/zod-openapi-components.js';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const info = new DocumentBuilder().setTitle('Omniva API').setVersion('1').build();
  return withZodComponents(SwaggerModule.createDocument(app, info));
}
