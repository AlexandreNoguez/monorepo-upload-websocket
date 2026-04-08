# Fase 1: Fundacao Do Monorepo

Este documento registra as decisoes da Fase 1 do checklist e explica:

- o que foi feito
- por que foi feito
- quais alternativas existem
- em que casos outra escolha poderia ser melhor

## 1. Gerenciador do monorepo

### Decisao

Usar `pnpm workspaces` como gerenciador principal do monorepo.

Arquivos criados:

- [package.json](/home/alexandre/workspace/web-socket/package.json)
- [pnpm-workspace.yaml](/home/alexandre/workspace/web-socket/pnpm-workspace.yaml)

### O que isso significa

O repositório passa a ter um ponto central para organizar os projetos JavaScript/TypeScript, especialmente:

- `apps/api`
- `packages/shared`

A Azure Function em Python continua dentro do mesmo repositório, mas nao depende do `pnpm` para existir. Isso e normal em monorepos poliglotas.

### Por que essa escolha faz sentido aqui

`pnpm` e uma escolha muito boa para estudo e para projeto real quando queremos:

- simplicidade
- instalacao rapida
- lockfile unico
- boa integracao com NestJS e ecossistema Node
- menos peso conceitual que ferramentas maiores

Como este projeto ainda esta na fase de fundacao, a melhor escolha nao e a mais poderosa. E a mais clara.

### Alternativas possiveis

#### `Nx`

Seria melhor se:

- voce quisesse geracao automatica de apps e libs
- quisesse cache, graph e generators desde o inicio
- tivesse uma base maior e varios times

Por que nao usamos agora:

- adiciona mais conceitos para estudar ao mesmo tempo
- o foco principal aqui e arquitetura, nao a ferramenta do workspace

#### `Turborepo`

Seria bom se:

- o foco fosse orquestracao de tarefas e cache remoto
- ja existissem varios apps Node maduros

Por que nao usamos agora:

- ainda nao temos pipeline suficiente para justificar a camada extra

#### Sem monorepo manager

Seria a escolha mais simples no curtissimo prazo, mas perde valor rapido porque:

- scripts ficam espalhados
- padroes ficam menos claros
- cresce o custo de organizacao

## 2. Estrutura inicial de pastas

### Decisao

Criar a estrutura base do monorepo antes de gerar codigo real.

Pastas criadas:

- `apps/api`
- `apps/image-processor-function`
- `packages/shared`
- `infra/docker`
- `infra/compose`
- `infra/scripts`

### Por que isso foi feito agora

Fazer a estrutura primeiro ajuda a separar responsabilidade antes da implementacao.

Isso reduz um problema muito comum em projetos iniciados rapido demais:

- tudo nasce na pasta errada
- depois mover arquivos fica doloroso
- o projeto fica com cara de temporario para sempre

### Melhor maneira?

Se fosse um projeto de empresa ja com padrao consolidado, talvez fosse melhor gerar os apps diretamente com a CLI de cada stack e deixar a estrutura surgir a partir disso.

Aqui, como o objetivo tambem e pedagogico, criar a estrutura antes ajuda voce a entender o mapa do sistema antes do codigo.

## 3. README e documentacao base

### Decisao

Manter o `README.md` como porta de entrada e criar documentacao complementar em `docs/`.

Arquivos principais:

- [README.md](/home/alexandre/workspace/web-socket/README.md)
- [docs/architecture.md](/home/alexandre/workspace/web-socket/docs/architecture.md)
- [docs/checklist.md](/home/alexandre/workspace/web-socket/docs/checklist.md)
- [docs/fase-1-fundacao.md](/home/alexandre/workspace/web-socket/docs/fase-1-fundacao.md)

### Por que isso e importante

Em projeto de estudo, documentacao nao e enfeite. Ela vira parte do aprendizado.

Sem isso, e muito facil esquecer:

- por que uma decisao foi tomada
- o que ainda falta
- qual e a funcao de cada pasta

## 4. Padrao de variaveis de ambiente

### Decisao

Criar um arquivo raiz [`.env.example`](/home/alexandre/workspace/web-socket/.env.example) com:

- variaveis compartilhadas
- prefixos por contexto
- valores locais de desenvolvimento

### Regra adotada

As variaveis foram agrupadas por contexto:

- `POSTGRES_*`
- `API_*`
- `AZURITE_*`
- `AZURE_STORAGE_*`
- `FUNCTION_*`

### Por que isso e importante

Quando as variaveis crescem sem padrao, surgem problemas como:

- nomes ambiguos
- duplicacao
- configuracao dificil de entender
- conflito entre servicos

Com prefixos, fica mais facil bater o olho e saber de onde cada valor vem.

### Haveria maneira melhor?

Sim, dependendo da maturidade do projeto:

- um `.env.example` por aplicacao
- validacao tipada com `zod` ou `class-validator`
- secret manager em vez de arquivos locais

Mas para a Fase 1, centralizar num unico exemplo e a melhor forma de explicar o panorama completo.

## 5. Convencao de nomes de servicos e containers

### Decisao

Adotar estes nomes logicos de servico:

- `api`
- `image-processor-function`
- `postgres`
- `azurite`

E estes nomes de dominio para as pastas:

- `apps/api`
- `apps/image-processor-function`
- `packages/shared`

### Por que esses nomes

Eles descrevem responsabilidade, nao tecnologia isolada.

Por exemplo:

- `api` descreve o papel do servico
- `image-processor-function` descreve o papel da Function

Isso e melhor do que nomes vagos como:

- `backend`
- `processor`
- `service1`

### Sobre nomes de container no Docker Compose

A recomendacao para a proxima fase e:

- usar `service name` como identidade principal
- evitar `container_name` fixo quando nao houver necessidade real

Por que?

Porque nomes fixos de container:

- dificultam escalabilidade
- podem causar conflito entre ambientes
- acoplam demais o compose ao nome manual

Quando precisarmos padronizar a execucao local, o ideal e usar `COMPOSE_PROJECT_NAME`, nao forcar todos os `container_name`.

## 6. Arquivos auxiliares de fundacao

### `.gitignore`

Foi criado para evitar versionar lixo comum de:

- Node.js
- Python
- arquivos locais de ambiente
- artefatos temporarios

### `.editorconfig`

Foi criado para reduzir inconsistencias de formatacao entre editores diferentes.

Isso ajuda cedo porque evita ruido desnecessario nos commits.

## 7. Conclusao da Fase 1

Ao final desta fase, o projeto ja tem:

- identidade de monorepo
- estrutura clara
- convencoes iniciais
- padrao de ambiente
- base documental

Ainda nao temos codigo executavel de aplicacao, e isso e intencional.

A Fase 1 existe para preparar terreno. O ganho aqui nao e funcionalidade visivel. O ganho e reduzir desordem futura.
