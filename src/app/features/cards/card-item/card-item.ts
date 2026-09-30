import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Card } from '../../../core/models/card.model';

/**
 * Exibe um card na listagem.
 *
 * Componente de apresentação: recebe os dados prontos e não conhece
 * service, HTTP ou regras de negócio. Isso o torna reutilizável e
 * simples de testar.
 */
@Component({
  selector: 'app-card-item',
  imports: [DatePipe],
  templateUrl: './card-item.html',
  styleUrl: './card-item.scss'
})
export class CardItem {
  /** Card a ser exibido. Obrigatório. */
  readonly card = input.required<Card>();

  /** Indica se o card está fixado, para exibir o selo correspondente. */
  readonly fixado = input<boolean>(false);
}