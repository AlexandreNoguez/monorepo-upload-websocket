import { Global, Module } from '@nestjs/common';

import { APPLICATION_CONFIG } from './application-config';
import { applicationConfigProvider } from './application-config.provider';

@Global()
@Module({
  providers: [applicationConfigProvider],
  exports: [APPLICATION_CONFIG]
})
export class ConfigurationModule {}
