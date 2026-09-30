import { Routes } from '@angular/router';

/**
 * Rotas da aplicação.
 *
 * Os componentes são carregados sob demanda (lazy loading): o código do
 * detalhe só é baixado quando o usuário acessa a rota, reduzindo o
 * tamanho do bundle inicial.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/cards/cards-list/cards-list').then((m) => m.CardsList),
    title: 'Notícias e publicações'
  },
  {
    path: 'card/:id',
    loadComponent: () =>
      import('./features/cards/card-detail/card-detail').then((m) => m.CardDetail),
    title: 'Detalhe da publicação'
  },
  { path: '**', redirectTo: '' }
];