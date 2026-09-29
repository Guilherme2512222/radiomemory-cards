import { Card } from '../models/card.model';

/**
 * Regras de negócio da listagem de cards.
 *
 * São funções puras (sem dependência de Angular, HTTP ou DOM): recebem
 * dados e devolvem dados. Isso as torna diretamente testáveis e mantém
 * a lógica de negócio separada da camada de apresentação.
 */

/** Converte a string de data da API em Date, ou null se não for uma data válida.
 *
 *  A API retorna data_fixo em três formatos distintos: uma data ISO,
 *  null, ou "0000-00-00" (data-zero do MySQL). Os dois últimos significam
 *  "sem pin" e precisam ser descartados aqui, pois new Date("0000-00-00")
 *  produz Invalid Date, que falha silenciosamente em comparações.
 */
export function parseData(valor: string | null | undefined): Date | null {
  if (!valor) return null;

  const data = new Date(valor);
  return isNaN(data.getTime()) ? null : data;
}

/**
 * Um card é fixado quando possui data_fixo e essa data ainda não passou.
 *
 * `agora` é recebido como parâmetro (com valor padrão) para tornar a
 * função determinística: nos testes, é possível simular qualquer momento
 * no tempo sem depender do relógio da máquina.
 */
export function isPinned(card: Card, agora: Date = new Date()): boolean {
  const dataFixo = parseData(card.data_fixo);
  return dataFixo !== null && dataFixo >= agora;
}

/** Mantém apenas os cards publicados (status = 1). */
export function apenasPublicados(cards: Card[]): Card[] {
  return cards.filter((card) => card.status === 1);
}

/**
 * Ordenação definida pelo enunciado:
 *   1. Fixados primeiro, ordenados por data_fixo decrescente.
 *   2. Em seguida, os não fixados, ordenados por data decrescente.
 *
 * Retorna um novo array — o array recebido não é modificado.
 */
export function sortCards(cards: Card[], agora: Date = new Date()): Card[] {
  const fixados: Card[] = [];
  const naoFixados: Card[] = [];

  for (const card of cards) {
    (isPinned(card, agora) ? fixados : naoFixados).push(card);
  }

  const porData = (campo: 'data' | 'data_fixo') => (a: Card, b: Card) => {
    const dataA = parseData(a[campo])?.getTime() ?? 0;
    const dataB = parseData(b[campo])?.getTime() ?? 0;
    return dataB - dataA; // decrescente: mais recente primeiro
  };

  return [
    ...fixados.sort(porData('data_fixo')),
    ...naoFixados.sort(porData('data'))
  ];
}

/** Normaliza texto para busca: minúsculas e sem acentos. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')                  // separa letra e acento
    .replace(/[\u0300-\u036f]/g, '');  // remove os acentos
}

export interface FiltrosCard {
  categoria?: string;
  busca?: string;
}

/**
 * Aplica filtro por categoria e busca textual.
 * A busca é case-insensitive e ignora acentos, cobrindo título e subtítulo.
 */
export function filterCards(cards: Card[], filtros: FiltrosCard): Card[] {
  const termo = filtros.busca ? normalizar(filtros.busca.trim()) : '';

  return cards.filter((card) => {
    if (filtros.categoria && card.categoria !== filtros.categoria) {
      return false;
    }

    if (termo) {
      const alvo = normalizar(`${card.titulo} ${card.subtitulo}`);
      if (!alvo.includes(termo)) return false;
    }

    return true;
  });
}

/**
 * Extrai as categorias disponíveis a partir dos próprios dados.
 *
 * Recebe a lista já filtrada por status: categorias que existem apenas
 * em cards não publicados não devem aparecer no seletor, sob risco de
 * o usuário selecionar uma opção que retorna lista vazia.
 */
export function extractCategories(cards: Card[]): string[] {
  return [...new Set(cards.map((card) => card.categoria))].sort();
}