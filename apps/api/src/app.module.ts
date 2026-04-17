import { Module } from '@nestjs/common';

import { ConfigurationModule } from './infrastructure/config/configuration.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { HealthModule } from './presentation/http/health/health.module';

@Module({
  imports: [ConfigurationModule, DatabaseModule, HealthModule]
})
export class AppModule {}
