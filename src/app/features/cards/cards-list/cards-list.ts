import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CardsService } from '../../../core/services/cards.service';
import { Card } from '../../../core/models/card.model';
import { CardItem } from '../card-item/card-item';
import {
  apenasPublicados,
  sortCards,
  isPinned,
  filterCards,
  extractCategories
} from '../../../core/rules/card-rules';

@Component({
  selector: 'app-cards-list',
  imports: [CardItem],
  templateUrl: './cards-list.html',
  styleUrl: './cards-list.scss'
})
export class CardsList implements OnInit {
  private readonly cardsService = inject(CardsService);

  /** Todos os cards publicados, já ordenados. Não muda com os filtros. */
  private readonly todosCards = signal<Card[]>([]);

  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  /** Filtros ativos. */
  readonly categoriaSelecionada = signal<string>('');
  readonly termoBusca = signal<string>('');

  private readonly agora = new Date();

  /** Categorias extraídas dos dados, para montar o seletor. */
  readonly categorias = computed(() => extractCategories(this.todosCards()));

  /** Cards após a aplicação dos filtros. */
  private readonly cardsFiltrados = computed(() =>
    filterCards(this.todosCards(), {
      categoria: this.categoriaSelecionada(),
      busca: this.termoBusca()
    })
  );

  readonly fixados = computed(() =>
    this.cardsFiltrados().filter((card) => isPinned(card, this.agora))
  );

  readonly naoFixados = computed(() =>
    this.cardsFiltrados().filter((card) => !isPinned(card, this.agora))
  );

  /** Total exibido, usado no contador de resultados. */
  readonly totalExibido = computed(() => this.cardsFiltrados().length);

  readonly temFiltroAtivo = computed(
    () => this.categoriaSelecionada() !== '' || this.termoBusca() !== ''
  );

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.cardsService.getTodosCards().subscribe({
      next: (resposta) => {
        const publicados = apenasPublicados(resposta);
        this.todosCards.set(sortCards(publicados, this.agora));
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os cards. Tente novamente.');
        this.carregando.set(false);
      }
    });
  }

  aoBuscar(evento: Event): void {
    this.termoBusca.set((evento.target as HTMLInputElement).value);
  }

  aoSelecionarCategoria(evento: Event): void {
    this.categoriaSelecionada.set((evento.target as HTMLSelectElement).value);
  }

  limparFiltros(): void {
    this.categoriaSelecionada.set('');
    this.termoBusca.set('');
  }
}