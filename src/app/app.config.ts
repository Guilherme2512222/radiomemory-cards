import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Registra os dados de formatação pt-BR (datas, números) usados pelos pipes.
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    // withComponentInputBinding permite que parâmetros de rota (ex.: :id)
    // sejam recebidos diretamente como input() no componente.
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};