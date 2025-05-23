import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHttpClient } from '@angular/common/http'; // ← notwendig
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // ← Füge das hinzu, damit HttpClient funktioniert!
    provideEchartsCore({
      echarts: () => import('echarts')
    })
  ]
};
