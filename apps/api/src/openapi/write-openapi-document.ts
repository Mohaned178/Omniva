import 'reflect-metadata';
import { writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from '../api.module.js';
import { configureApi } from '../configure-api.js';
import { loadAppConfig } from '../platform/config/app-config.js';
import { buildOpenApiDocument } from './build-openapi-document.js';

const OUTPUT_FILE = new URL('../../openapi.json', import.meta.url);

// The document is built from route metadata alone. The app is never initialised, so these
// placeholder addresses are never connected to.
const config = loadAppConfig({
  DATABASE_URL: 'postgresql://openapi@localhost/unused',
  REDIS_URL: 'redis://localhost/unused',
  WEB_ORIGIN: 'http://localhost',
  API_PUBLIC_URL: 'http://localhost',
  SMTP_URL: 'smtp://localhost',
  AUTH_SECRET: 'openapi-generation-placeholder-secret-never-used',
});
const app = await NestFactory.create(ApiModule.forRoot(config), { logger: false });
configureApi(app, config);
await writeFile(OUTPUT_FILE, `${JSON.stringify(buildOpenApiDocument(app), null, 2)}\n`);
