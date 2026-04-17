import { Inject, Injectable } from '@nestjs/common';

import {
  APPLICATION_CONFIG,
  ApplicationConfig
} from '../../infrastructure/config/application-config';
import { HealthStatusResponse } from './health-status.response';

@Injectable()
export class GetHealthStatusUseCase {
  public constructor(
    @Inject(APPLICATION_CONFIG)
    private readonly applicationConfig: ApplicationConfig
  ) {}

  public execute(): HealthStatusResponse {
    const currentTimestamp = new Date().toISOString();
    const uptimeInSeconds = Math.round(process.uptime());

    return {
      status: 'ok',
      serviceName: this.applicationConfig.serviceName,
      runtimeEnvironment: this.applicationConfig.runtimeEnvironment,
      uptimeInSeconds,
      timestamp: currentTimestamp
    };
  }
}
