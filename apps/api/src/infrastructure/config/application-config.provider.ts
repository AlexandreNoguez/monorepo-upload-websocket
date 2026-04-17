import { Provider } from '@nestjs/common';

import {
  APPLICATION_CONFIG,
  ApplicationConfig,
  loadApplicationConfig
} from './application-config';

export const applicationConfigProvider: Provider<ApplicationConfig> = {
  provide: APPLICATION_CONFIG,
  useFactory: () => loadApplicationConfig(process.env)
};
