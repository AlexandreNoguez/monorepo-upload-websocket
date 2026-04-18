import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { APPLICATION_CONFIG, ApplicationConfig } from './application-config';
import { ValidatedEnvironmentVariables } from './environment-variables';

export const applicationConfigProvider: Provider<ApplicationConfig> = {
  provide: APPLICATION_CONFIG,
  inject: [ConfigService],
  useFactory: (
    configService: ConfigService<ValidatedEnvironmentVariables>
  ): ApplicationConfig => ({
    apiPort: readRequiredConfigValue<number>(configService, 'API_PORT'),
    apiPrefix: readRequiredConfigValue<string>(configService, 'API_PREFIX'),
    runtimeEnvironment: readRequiredConfigValue(configService, 'APP_RUNTIME'),
    serviceName: readRequiredConfigValue<string>(configService, 'SERVICE_NAME')
  })
};

function readRequiredConfigValue<TValue>(
  configService: ConfigService<ValidatedEnvironmentVariables>,
  configKey: keyof ValidatedEnvironmentVariables
): TValue {
  const configValue = configService.get<TValue>(configKey);

  if (configValue === undefined || configValue === null) {
    throw new Error(`Missing required configuration value "${configKey}".`);
  }

  return configValue;
}
