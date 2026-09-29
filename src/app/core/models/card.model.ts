/**
 * Representa um card (notícia/post) retornado pela API.
 *
 * Observações levantadas na inspeção da resposta real do endpoint
 * ({ acao: "getTodosCards" }, 9 registros em 29/09/2026):
 *
 * - `data_fixo` pode vir de três formas: uma data ISO válida, `null`,
 *   ou a string "0000-00-00" (data-zero do MySQL). As duas últimas
 *   significam "sem pin" e precisam ser tratadas antes de virar Date,
 *   pois new Date("0000-00-00") resulta em Invalid Date.
 *
 * - `corpo` vem como HTML com entidades (&aacute;, &ccedil;) e precisa
 *   ser sanitizado antes de ser exibido via innerHTML.
 *
 * - `status` 0 indica registro não publicado: não deve ser renderizado.
 *
 * - `imgUrl` e `videoUrl` podem vir nulos.
 */
export interface Card {
  id: number;
  titulo: string;
  subtitulo: string;
  corpo: string;
  urlPost: string;
  imgUrl: string | null;
  autor: string;
  status: number;
  data: string;
  categoria: string;
  videoUrl: string | null;
  data_fixo: string | null;
}