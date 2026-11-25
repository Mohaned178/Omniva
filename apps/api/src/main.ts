import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module.js';
import { configureApi } from './configure-api.js';
import { loadAppConfig } from './platform/config/app-config.js';

const config = loadAppConfig(process.env);
const app = await NestFactory.create(ApiModule.forRoot(config));
configureApi(app, config);
await app.listen(config.apiPort);
