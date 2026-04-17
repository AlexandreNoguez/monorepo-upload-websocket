import { Controller, Get } from '@nestjs/common';

import { GetHealthStatusUseCase } from '../../../application/health/get-health-status.use-case';
import { HealthStatusResponse } from '../../../application/health/health-status.response';

@Controller('health')
export class HealthController {
  public constructor(private readonly getHealthStatusUseCase: GetHealthStatusUseCase) {}

  @Get()
  public getHealthStatus(): HealthStatusResponse {
    return this.getHealthStatusUseCase.execute();
  }
}
