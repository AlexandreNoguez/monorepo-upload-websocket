import { Module } from '@nestjs/common';

import { ConfigurationModule } from './infrastructure/config/configuration.module';
import { HealthModule } from './presentation/http/health/health.module';

@Module({
  imports: [ConfigurationModule, HealthModule]
})
export class AppModule {}
