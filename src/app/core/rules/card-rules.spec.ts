import { Card } from '../models/card.model';
import {
  isPinned,
  sortCards,
  filterCards,
  apenasPublicados,
  extractCategories
} from './card-rules';

/** Cria um card com valores padrão, sobrescrevendo apenas o necessário em cada teste. */
function criarCard(dados: Partial<Card>): Card {
  return {
    id: 1,
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    corpo: '<p>corpo</p>',
    urlPost: 'https://exemplo.com',
    imgUrl: null,
    autor: 'autor@exemplo.com',
    status: 1,
    data: '2026-01-01T00:00:00.000Z',
    categoria: 'blog',
    videoUrl: null,
    data_fixo: null,
    ...dados
  };
}

describe('isPinned', () => {
  const card = criarCard({ data_fixo: '2026-12-31T00:00:00.000Z' });

  it('considera fixado quando data_fixo ainda não chegou', () => {
    expect(isPinned(card, new Date('2026-06-01'))).toBe(true);
  });

  it('deixa de considerar fixado depois que data_fixo passa', () => {
    expect(isPinned(card, new Date('2027-01-01'))).toBe(false);
  });

  it('não considera fixado quando data_fixo é null', () => {
    expect(isPinned(criarCard({ data_fixo: null }))).toBe(false);
  });

  it('não considera fixado quando data_fixo é "0000-00-00" (data-zero do MySQL)', () => {
    expect(isPinned(criarCard({ data_fixo: '0000-00-00' }))).toBe(false);
  });
});

describe('apenasPublicados', () => {
  it('remove cards com status diferente de 1', () => {
    const cards = [
      criarCard({ id: 1, status: 1 }),
      criarCard({ id: 2, status: 0 })
    ];

    const resultado = apenasPublicados(cards);

    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe(1);
  });
});

describe('sortCards', () => {
  const agora = new Date('2026-06-01');

  it('coloca os fixados antes dos não fixados', () => {
    const cards = [
      criarCard({ id: 1, data_fixo: null }),
      criarCard({ id: 2, data_fixo: '2026-12-31T00:00:00.000Z' })
    ];

    expect(sortCards(cards, agora).map((c) => c.id)).toEqual([2, 1]);
  });

  it('ordena os fixados por data_fixo decrescente', () => {
    const cards = [
      criarCard({ id: 1, data_fixo: '2026-07-01T00:00:00.000Z' }),
      criarCard({ id: 2, data_fixo: '2026-12-31T00:00:00.000Z' })
    ];

    expect(sortCards(cards, agora).map((c) => c.id)).toEqual([2, 1]);
  });

  it('ordena os não fixados por data decrescente', () => {
    const cards = [
      criarCard({ id: 1, data: '2025-01-01T00:00:00.000Z' }),
      criarCard({ id: 2, data: '2026-05-01T00:00:00.000Z' })
    ];

    expect(sortCards(cards, agora).map((c) => c.id)).toEqual([2, 1]);
  });

  it('não modifica o array recebido', () => {
    const cards = [
      criarCard({ id: 1, data: '2025-01-01T00:00:00.000Z' }),
      criarCard({ id: 2, data: '2026-05-01T00:00:00.000Z' })
    ];

    sortCards(cards, agora);

    expect(cards.map((c) => c.id)).toEqual([1, 2]);
  });
});

describe('filterCards', () => {
  const cards = [
    criarCard({ id: 1, categoria: 'blog', titulo: '24ª Jornada da JABRO' }),
    criarCard({ id: 2, categoria: 'treinamento', titulo: 'Novo treinamento' }),
    criarCard({ id: 3, categoria: 'blog', subtitulo: 'Evento da JABRO em julho' })
  ];

  it('filtra por categoria', () => {
    const resultado = filterCards(cards, { categoria: 'blog' });

    expect(resultado.length).toBe(2);
    expect(resultado.every((c) => c.categoria === 'blog')).toBe(true);
  });

  it('busca em título e subtítulo, ignorando maiúsculas', () => {
    expect(filterCards(cards, { busca: 'jabro' }).map((c) => c.id)).toEqual([1, 3]);
  });

  it('combina categoria e busca', () => {
    const resultado = filterCards(cards, { categoria: 'blog', busca: 'jornada' });

    expect(resultado.map((c) => c.id)).toEqual([1]);
  });

  it('retorna todos os cards quando não há filtros', () => {
    expect(filterCards(cards, {}).length).toBe(3);
  });
});

describe('extractCategories', () => {
  it('lista categorias únicas em ordem alfabética', () => {
    const cards = [
      criarCard({ categoria: 'treinamento' }),
      criarCard({ categoria: 'blog' }),
      criarCard({ categoria: 'blog' })
    ];

    expect(extractCategories(cards)).toEqual(['blog', 'treinamento']);
  });
});