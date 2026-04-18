import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigurationModule } from '@nestjs/config';

import { APPLICATION_CONFIG } from './application-config';
import { applicationConfigProvider } from './application-config.provider';
import { validateEnvironmentVariables } from './environment-variables';

@Global()
@Module({
  imports: [
    NestConfigurationModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validate: validateEnvironmentVariables
    })
  ],
  providers: [applicationConfigProvider],
  exports: [APPLICATION_CONFIG, NestConfigurationModule]
})
export class ConfigurationModule {}
