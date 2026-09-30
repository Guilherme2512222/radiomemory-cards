import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CardsService } from '../../../core/services/cards.service';
import { Card } from '../../../core/models/card.model';
import { CardItem } from '../card-item/card-item';
import {
  apenasPublicados,
  sortCards,
  isPinned
} from '../../../core/rules/card-rules';

/**
 * Página de listagem de cards.
 *
 * Concentra o estado da tela (carregando / erro / dados) e delega:
 * - a busca dos dados ao CardsService;
 * - as regras de negócio às funções puras de core/rules;
 * - a exibição de cada card ao CardItem.
 */
@Component({
  selector: 'app-cards-list',
  imports: [CardItem],
  templateUrl: './cards-list.html',
  styleUrl: './cards-list.scss'
})
export class CardsList implements OnInit {
  private readonly cardsService = inject(CardsService);

  /** Cards publicados, já ordenados conforme a regra de negócio. */
  readonly cards = signal<Card[]>([]);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  /**
   * Momento de referência para a regra de pin.
   * Fixado no carregamento para que a ordenação não mude durante a
   * navegação — a regra define a ordem "uma única vez".
   */
  private readonly agora = new Date();

  /** Cards fixados, exibidos em destaque antes da listagem geral. */
  readonly fixados = computed(() =>
    this.cards().filter((card) => isPinned(card, this.agora))
  );

  /** Demais cards, na ordem definida pela regra de negócio. */
  readonly naoFixados = computed(() =>
    this.cards().filter((card) => !isPinned(card, this.agora))
  );

  ngOnInit(): void {
    this.carregar();
  }

  /** Busca os cards na API e aplica filtro de status e ordenação. */
  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.cardsService.getTodosCards().subscribe({
      next: (resposta) => {
        const publicados = apenasPublicados(resposta);
        this.cards.set(sortCards(publicados, this.agora));
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os cards. Tente novamente.');
        this.carregando.set(false);
      }
    });
  }
}