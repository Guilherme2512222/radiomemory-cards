import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../models/card.model';
import { environment } from '../../../environments/environment';

/**
 * Responsável por buscar os cards na API.
 *
 * A API expõe um único endpoint POST: a operação desejada vai no corpo
 * da requisição (campo `acao`), em vez de rotas REST distintas.
 */
@Injectable({ providedIn: 'root' })
export class CardsService {
  private readonly http = inject(HttpClient);

  /**
   * Busca todos os cards, sem nenhum tratamento.
   * Filtro de status, ordenação e busca são responsabilidade das regras
   * de negócio (core/rules), não desta camada.
   */
  getTodosCards(): Observable<Card[]> {
    return this.http.post<Card[]>(environment.apiUrl, { acao: 'getTodosCards' });
  }
}