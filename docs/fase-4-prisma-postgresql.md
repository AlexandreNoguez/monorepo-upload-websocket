# Fase 4: Prisma E PostgreSQL

Esta fase iniciou a persistencia real da API.

## 1. Objetivo

O objetivo foi preparar o banco antes de implementar dominio, upload, Function e WebSocket.

Isso e importante porque quase todos os proximos fluxos precisam registrar estado:

- imagem solicitada
- upload confirmado
- job iniciado
- progresso do processamento
- variantes geradas
- falhas

Sem banco, a gente acabaria simulando estado em memoria e refatorando cedo demais.

## 2. O que foi criado

- [apps/api/prisma/schema.prisma](/home/alexandre/workspace/web-socket/apps/api/prisma/schema.prisma)
- [apps/api/prisma.config.ts](/home/alexandre/workspace/web-socket/apps/api/prisma.config.ts)
- [apps/api/prisma/migrations/20260417195000_initial_image_processing_schema/migration.sql](/home/alexandre/workspace/web-socket/apps/api/prisma/migrations/20260417195000_initial_image_processing_schema/migration.sql)
- [apps/api/src/infrastructure/database/prisma.service.ts](/home/alexandre/workspace/web-socket/apps/api/src/infrastructure/database/prisma.service.ts)
- [apps/api/src/infrastructure/database/database.module.ts](/home/alexandre/workspace/web-socket/apps/api/src/infrastructure/database/database.module.ts)
- [apps/api/.env.example](/home/alexandre/workspace/web-socket/apps/api/.env.example)

## 3. Por que Prisma fica em `infrastructure`

Prisma e uma ferramenta de infraestrutura.

Ele sabe falar com o banco, mas nao deve ser dono das regras de negocio.

Por isso, o `PrismaService` fica em:

```text
apps/api/src/infrastructure/database
```

Mais tarde, os casos de uso vao depender de portas/repository contracts, e a infraestrutura vai implementar essas portas com Prisma.

## 4. Por que ainda nao criamos repositories

Os repositories ficaram para depois da modelagem de dominio.

Isso e intencional.

Se criarmos repositories agora, antes de definir entidades como `ImageAsset` e `ProcessingJob`, corremos o risco de criar metodos baseados demais no banco e pouco baseados no dominio.

A ordem mais saudavel e:

1. modelar dominio
2. definir contratos de repository na camada `application` ou `domain`
3. implementar esses contratos com Prisma em `infrastructure`

## 5. Modelos criados

### `ImageAsset`

Representa a imagem original enviada pelo usuario.

Ela guarda:

- nome original
- MIME type
- tamanho
- blob container original
- blob key original
- status atual

### `ProcessingJob`

Representa uma execucao de processamento para uma imagem.

Ele guarda:

- imagem relacionada
- status do job
- percentual de progresso
- erro, quando houver
- identificador de execucao da Function
- inicio e fim do processamento

### `ProcessedVariant`

Representa um artefato derivado da imagem original.

Exemplos:

- thumbnail
- grayscale

### `ProcessingEvent`

Representa o historico de eventos do processamento.

Isso sera importante para:

- auditoria
- debug
- rastreabilidade
- idempotencia futura

## 6. Por que usar migrations

Migration e a forma versionada de evoluir o banco.

Em vez de cada pessoa criar tabelas manualmente, o projeto passa a ter um historico claro:

```text
prisma/migrations
```

Isso permite reproduzir o banco localmente e depois em ambientes maiores.

## 7. Prisma 7 e `prisma.config.ts`

Estamos usando Prisma 7.

Nessa versao, a URL do banco fica no [prisma.config.ts](/home/alexandre/workspace/web-socket/apps/api/prisma.config.ts), nao no `schema.prisma`.

O `schema.prisma` descreve:

- datasource provider
- generator
- models
- enums
- relations

O `prisma.config.ts` descreve:

- caminho do schema
- caminho das migrations
- URL real do banco

Essa separacao e o caminho recomendado no Prisma 7.

## 8. Comandos principais

Validar schema:

```bash
pnpm --filter @web-socket/api prisma:validate
```

Gerar Prisma Client:

```bash
pnpm --filter @web-socket/api prisma:generate
```

Rodar migration em desenvolvimento:

```bash
pnpm --filter @web-socket/api prisma:migrate:dev
```

Typecheck da API:

```bash
pnpm --filter @web-socket/api typecheck
```

Build da API:

```bash
pnpm api:build
```

## 9. O que ficou para depois

Ainda faltam dois itens da Fase 4:

- seed opcional de desenvolvimento
- repositories implementados com Prisma

Eles ficam melhores depois da Fase 5, quando as entidades de dominio estiverem definidas.

## 10. Resultado desta fase

Ao final desta etapa, a API ja tem a base de persistencia para sustentar os proximos fluxos.

Agora o proximo passo natural e a Fase 5: modelar o dominio.
