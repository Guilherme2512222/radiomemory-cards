import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import { CardsService } from '../../../core/services/cards.service';
import { Card } from '../../../core/models/card.model';
import { apenasPublicados, isPinned } from '../../../core/rules/card-rules';

/**
 * Página de detalhe de um card.
 *
 * O id vem da rota (/card/:id). Como a API expõe apenas a operação
 * getTodosCards, o card é localizado na lista completa — não há endpoint
 * para busca individual.
 */
@Component({
  selector: 'app-card-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './card-detail.html',
  styleUrl: './card-detail.scss'
})
export class CardDetail implements OnInit {
  private readonly cardsService = inject(CardsService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Id recebido da rota, graças a withComponentInputBinding. */
  readonly id = input.required<string>();

  readonly card = signal<Card | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal<string | null>(null);

  readonly fixado = computed(() => {
    const atual = this.card();
    return atual ? isPinned(atual) : false;
  });

  /**
   * Corpo do card sanitizado com DOMPurify antes de ser inserido no DOM.
   *
   * O Angular já sanitiza [innerHTML] por padrão, mas o DOMPurify adiciona
   * uma segunda camada com política explícita: declaramos exatamente quais
   * tags e atributos são aceitos, tornando a regra auditável e independente
   * do comportamento interno do framework.
   */
  readonly corpoSanitizado = computed<SafeHtml>(() => {
    const atual = this.card();
    if (!atual) return '';

    const limpo = DOMPurify.sanitize(atual.corpo, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'figure',
        'figcaption', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'style']
    });

    return this.sanitizer.bypassSecurityTrustHtml(limpo);
  });

  /**
   * URL do vídeo marcada como confiável para uso em iframe.
   *
   * O Angular bloqueia URLs dinâmicas em [src] de iframe por padrão. A
   * liberação só ocorre após validar que o endereço pertence ao domínio de
   * embed do YouTube, evitando carregar um valor arbitrário vindo da API.
   */
  readonly videoSeguro = computed<SafeResourceUrl | null>(() => {
    const url = this.card()?.videoUrl;
    if (!url) return null;

    const ehEmbedYoutube = /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//.test(url);
    if (!ehEmbedYoutube) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.cardsService.getTodosCards().subscribe({
      next: (resposta) => {
        const encontrado = apenasPublicados(resposta).find(
          (item) => item.id === Number(this.id())
        );

        if (!encontrado) {
          this.erro.set('Publicação não encontrada.');
        } else {
          this.card.set(encontrado);
        }

        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar a publicação.');
        this.carregando.set(false);
      }
    });
  }
}