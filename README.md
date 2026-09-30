# Visualizador de Notícias/Posts — Radio Memory

Aplicação Angular que consome um endpoint autenticado e lista, filtra e exibe
publicações em formato de cards.

Teste prático para a vaga de estágio.

---

## Stack

- **Angular 22** (standalone components, zoneless, signals)
- **TypeScript** — tipagem estrita
- **SCSS** — sem framework de UI
- **DOMPurify** — sanitização do HTML vindo da API
- **Vitest** — testes unitários das regras de negócio

---

## Como rodar

### Pré-requisitos

- Node.js 20 ou superior
- npm

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o token (ver seção abaixo)
cp src/environments/environment.ts src/environments/environment.local.ts
# edite environment.local.ts e preencha apiToken

# 3. Rodar em desenvolvimento
npm start
```

A aplicação sobe em `http://localhost:4200`.

### Outros comandos

```bash
npm test              # testes unitários
npm run build         # build de produção
```

---

## Configuração do token

O token **não é versionado**. O projeto usa dois arquivos de ambiente:

| Arquivo | Conteúdo | Versionado |
|---|---|---|
| `src/environments/environment.ts` | Modelo, com `apiToken` vazio | Sim |
| `src/environments/environment.local.ts` | Token real | **Não** (está no `.gitignore`) |

Na compilação em modo desenvolvimento, o Angular substitui um arquivo pelo outro
via `fileReplacements` no `angular.json`. O código sempre importa de
`environment.ts` e não toma conhecimento da troca.

Para configurar:

```ts
// src/environments/environment.local.ts
export const environment = {
  production: false,
  apiUrl: 'https://6fx8kzbiw3.execute-api.us-east-2.amazonaws.com/prod',
  apiToken: 'COLE_O_TOKEN_AQUI',
};
```

É possível verificar que o arquivo está protegido:

```bash
git check-ignore -v src/environments/environment.local.ts
```

### Limitação conhecida

Em uma aplicação exclusivamente front-end, o token **sempre fica visível** na aba
Network do navegador — não há como ocultá-lo do usuário final. O requisito
atendido aqui é o de não versionar a credencial no repositório.

Para um cenário de produção, a abordagem correta seria um *backend for frontend*
(BFF) atuando como proxy: o navegador chamaria o BFF sem credencial, e o token
ficaria apenas no servidor. Isso foi considerado fora de escopo por conta do
não-requisito "backend adicional".

---

## Decisões técnicas

### Arquitetura

```
src/app/
├── core/
│   ├── models/         # interface Card
│   ├── services/       # acesso à API
│   ├── rules/          # regras de negócio (funções puras)
│   └── interceptors/   # injeção do header Authorization
└── features/cards/
    ├── cards-list/     # listagem: estado da tela
    ├── card-item/      # card individual: apresentação
    └── card-detail/    # detalhe
```

A separação segue um princípio simples: **o service não conhece a tela, as regras
não conhecem o Angular, e o componente de apresentação não conhece HTTP.**

As regras de negócio (`core/rules/card-rules.ts`) são funções puras — recebem
dados e devolvem dados. Isso as torna diretamente testáveis, sem necessidade de
instanciar componentes ou simular requisições. Os 14 testes desse arquivo rodam
em poucos milissegundos.

### Autenticação

O header `Authorization` é injetado por um `HttpInterceptor`, não em cada chamada.
Assim, nenhuma requisição pode sair sem autenticação por esquecimento. O
interceptor verifica a URL de destino e só adiciona a credencial em chamadas
dirigidas à API.

### Sanitização

O corpo dos posts vem como HTML da API e é inserido via `[innerHTML]`.

O Angular já sanitiza esse binding por padrão, mas o projeto adiciona **DOMPurify**
como segunda camada, com uma política explícita: a lista de tags e atributos
permitidos está declarada no código, o que torna a regra auditável e independente
do comportamento interno do framework.

Tags como `<script>`, `<iframe>` e `<object>` não constam da lista permitida e são
removidas.

### Vídeo

O Angular bloqueia URLs dinâmicas em `[src]` de iframe. A liberação via
`bypassSecurityTrustResourceUrl` só ocorre **após validar** que a URL pertence ao
domínio de embed do YouTube — confiar cegamente no valor vindo da API abriria uma
brecha de injeção.

### Roteamento

O detalhe é uma rota (`/card/:id`), não um modal. Motivos:

- O link é compartilhável e permite acesso direto
- O botão "voltar" do navegador funciona naturalmente
- Permite *lazy loading*, reduzindo o bundle inicial
- O título da aba muda conforme a página

Ambas as abordagens são aceitas pelo enunciado.

### Filtros

Filtro e busca são aplicados **em memória**, sobre os dados já carregados. A API
retorna a coleção completa em uma única chamada (9 registros), então filtrar no
cliente é instantâneo e evita requisições desnecessárias.

A busca é case-insensitive e ignora acentuação (normalização NFD).

---

## Observações sobre os dados da API

Levantadas ao inspecionar a resposta real do endpoint:

**1. `data_fixo` chega em três formatos:** uma data ISO válida, `null`, ou a
string `"0000-00-00"` (data-zero do MySQL). As duas últimas significam "sem pin".
O tratamento é centralizado na função `parseData`, que descarta valores inválidos
— `new Date("0000-00-00")` produz `Invalid Date`, que falharia silenciosamente em
comparações.

**2. Nenhum card está atualmente fixado.** As datas de `data_fixo` presentes na
base (2025-01-10, 2025-02-11, 2025-04-10 e 2026-01-07) já passaram. A seção
"Fixados" da interface, portanto, não aparece ao rodar contra a API — o que é o
comportamento correto. A regra foi validada por testes unitários com datas
controladas.

**3. As categorias `update` e `suporte` só existem em cards com `status: 0`.**
Por isso o seletor de categorias é montado a partir da lista **já filtrada por
status**: caso contrário, o usuário poderia selecionar uma categoria e receber uma
lista vazia.

**4. O corpo vem com entidades HTML** (`&aacute;`, `&ccedil;`), decodificadas
corretamente na renderização.

---

## Testes

```bash
npm test
```

Cobrem os casos mínimos do enunciado:

| Caso | Teste |
|---|---|
| Pin com data futura | `isPinned` retorna `true` antes de `data_fixo` |
| Pin expirado | `isPinned` retorna `false` após `data_fixo` |
| Ordenação | Fixados primeiro; não fixados por `data` desc |
| Filtro por categoria | Retorna apenas a categoria selecionada |
| Busca | "JABRO" localiza o card correspondente |

A função `isPinned` recebe a data de referência como parâmetro (com valor padrão
`new Date()`). Isso permite simular qualquer momento no tempo nos testes, sem
depender do relógio da máquina — o caso "o card deixa de ser fixado" seria
impossível de testar de outra forma.

---

## Requisitos atendidos

- [x] Listagem de cards com imagem, título, subtítulo, data, categoria e autor
- [x] Apenas `status = 1` é renderizado
- [x] Ordenação: fixados por `data_fixo` desc, demais por `data` desc
- [x] Filtro por categoria e busca em título/subtítulo
- [x] Detalhe com corpo sanitizado, imagem, vídeo e link externo
- [x] `urlPost` abre em nova aba (`rel="noopener noreferrer"`)
- [x] Datas em pt-BR (`03/02/2025 13:56`)
- [x] Skeletons durante o carregamento
- [x] Tratamento de erro com opção de recarregar
- [x] Token fora do versionamento
- [x] Categorias montadas a partir dos dados retornados *(bônus)*

---

## Autor

Guilherme — teste prático Radio Memory, setembro de 2026.