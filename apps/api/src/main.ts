import 'reflect-metadata';

import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { APPLICATION_CONFIG, ApplicationConfig } from './infrastructure/config/application-config';
import { createBootstrapLogger } from './infrastructure/logging/create-bootstrap-logger';

async function bootstrapApplication(): Promise<void> {
  const nestApplication = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const applicationConfig = nestApplication.get<ApplicationConfig>(APPLICATION_CONFIG);
  const bootstrapLogger = createBootstrapLogger(applicationConfig.runtimeEnvironment);
  const enabledLogLevels: LogLevel[] = bootstrapLogger.getEnabledLogLevels();

  nestApplication.useLogger(enabledLogLevels);

  if (applicationConfig.apiPrefix.length > 0) {
    // Health checks stay outside the API prefix so Docker and Kubernetes probes can use /health.
    nestApplication.setGlobalPrefix(applicationConfig.apiPrefix, {
      exclude: ['health']
    });
  }

  await nestApplication.listen(applicationConfig.apiPort, '0.0.0.0');

  bootstrapLogger.log(
    `API is running on port ${applicationConfig.apiPort} with prefix "${applicationConfig.apiPrefix}"`
  );
}

void bootstrapApplication();
