import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardsService } from './core/services/cards.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('radiomemory-cards');

  private readonly cardsService = inject(CardsService);

  // TESTE TEMPORÁRIO — verifica a conexão com a API.
  // Será removido quando a listagem real for implementada.
  ngOnInit(): void {
    this.cardsService.getTodosCards().subscribe({
      next: (cards) => console.log('Cards recebidos:', cards.length, cards),
      error: (erro) => console.error('Erro ao buscar cards:', erro)
    });
  }
}