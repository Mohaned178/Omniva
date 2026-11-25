import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadAppConfig } from './platform/config/app-config.js';
import { WorkerModule } from './worker.module.js';

const config = loadAppConfig(process.env);
const worker = await NestFactory.createApplicationContext(WorkerModule.forRoot(config));
worker.enableShutdownHooks();
await worker.init();
