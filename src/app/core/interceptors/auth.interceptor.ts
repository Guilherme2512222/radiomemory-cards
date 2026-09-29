import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Injeta o header Authorization em todas as requisições dirigidas à API.
 *
 * Centralizar isso aqui evita repetir o header em cada chamada e garante
 * que nenhuma requisição saia sem autenticação por esquecimento.
 *
 * O token é lido do environment — em desenvolvimento, o Angular substitui
 * environment.ts por environment.local.ts (ver fileReplacements no
 * angular.json), mantendo a credencial fora do versionamento.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Requisições para outros destinos (ex.: assets locais) seguem sem alteração.
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const reqAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.apiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  return next(reqAutenticada);
};