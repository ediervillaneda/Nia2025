import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ConfigService } from './services/config.service';

export function initializeConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfigService],
      multi: true
    }
  ]
};
