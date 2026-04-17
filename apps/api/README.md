# API

Esta pasta contem a aplicacao NestJS principal.

Responsabilidades:

- expor API HTTP
- expor gateway WebSocket
- aplicar casos de uso
- persistir dados com Prisma

## Estrutura inicial

- `src/domain`: regras de negocio puras
- `src/application`: casos de uso e contratos de entrada/saida
- `src/infrastructure`: configuracao, banco, storage, logging e adapters externos
- `src/presentation`: controllers HTTP, gateways WebSocket e adapters de entrada

## Health check

O primeiro endpoint real e:

```bash
GET /health
```

Ele fica fora do prefixo global da API para continuar funcionando com Docker e Kubernetes probes.

## Prisma

O Prisma fica em:

- `prisma/schema.prisma`
- `prisma.config.ts`
- `src/infrastructure/database`

Comandos principais:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:dev
```

O projeto usa Prisma 7, então a URL do banco fica no `prisma.config.ts` e não no `schema.prisma`.
