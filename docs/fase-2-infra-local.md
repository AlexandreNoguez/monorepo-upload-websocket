# Fase 2: Infraestrutura Local Com Docker

Este documento registra o que foi feito na Fase 2 e explica:

- como a stack local foi montada
- por que cada servico existe
- por que adotamos `compose` base + override de desenvolvimento
- por que usamos Dockerfiles multistage desde ja

## 1. O que foi criado

Arquivos principais:

- [docker-compose.yml](/home/alexandre/workspace/web-socket/docker-compose.yml)
- [docker-compose.dev.yml](/home/alexandre/workspace/web-socket/docker-compose.dev.yml)
- [infra/docker/api/Dockerfile](/home/alexandre/workspace/web-socket/infra/docker/api/Dockerfile)
- [infra/docker/function/Dockerfile](/home/alexandre/workspace/web-socket/infra/docker/function/Dockerfile)
- [infra/scripts/validate-network.sh](/home/alexandre/workspace/web-socket/infra/scripts/validate-network.sh)
- [docs/fase-2-infra-local.md](/home/alexandre/workspace/web-socket/docs/fase-2-infra-local.md)

## 2. Servicos da stack

### `postgres`

Responsavel por persistencia relacional do projeto.

Foi escolhido agora porque:

- Prisma vai depender dele nas proximas fases
- os casos de uso vao persistir estado nele
- subir cedo evita desenhar um sistema sem pensar na persistencia real

### `azurite`

Responsavel por emular localmente o Azure Blob Storage.

Foi escolhido agora porque:

- o upload da imagem vai depender dele
- a Azure Function vai reagir aos arquivos que chegarem nele
- estudar storage local cedo evita acoplamento com a nuvem real

### `api`

Neste momento e um container do futuro app NestJS com duas formas de execucao:

- `production` no arquivo base
- `development` no arquivo de override

Ele ainda nao sobe NestJS de verdade. Em vez de `tail -f /dev/null`, agora ele sobe um servidor placeholder HTTP e responde healthcheck.

Por que fazer assim agora?

- a Fase 2 continua focada em infraestrutura
- a stack passa a se comportar como servico real, ouvindo porta e respondendo healthcheck
- quando a Fase 3 chegar, substituiremos o placeholder sem refazer a estrutura do container

### `image-processor-function`

Neste momento e um container da futura Azure Function com duas formas de execucao:

- `production` no arquivo base
- `development` no arquivo de override

Ela ainda nao sobe o Functions Host real. Em vez de ficar parada, agora responde HTTP e healthcheck, o que torna a stack mais honesta.

Por que fazer assim agora?

- a Fase 8 ainda vai cuidar da Function real
- a infraestrutura ja fica pronta para diferenciar runtime de desenvolvimento
- conseguimos validar dependencia e rede com mais fidelidade

## 3. Por que usar `docker-compose.yml` base e `docker-compose.dev.yml` como override

Essa e a abordagem mais equilibrada para o projeto neste momento.

### O que cada arquivo representa

- `docker-compose.yml`: stack base, mais proxima de runtime estavel
- `docker-compose.dev.yml`: ajustes de desenvolvimento, como bind mounts e target `development`

### Por que isso e melhor do que um unico compose gigante

- separa preocupacoes
- evita condicao especial demais em um arquivo unico
- deixa mais claro o que e infraestrutura base e o que e conveniencia de desenvolvimento
- aproxima o projeto de um fluxo profissional sem exagerar na complexidade

### Como isso conversa com os Dockerfiles multistage

Os Dockerfiles agora possuem targets explicitos:

- `production`
- `development`

Isso permite que o mesmo Dockerfile sirva a dois contextos:

- imagem mais proxima do runtime final
- imagem com comportamento de desenvolvimento

O ganho aqui e muito importante: a gente evita manter dois Dockerfiles quase iguais e reduz divergencia entre ambientes.

## 4. Por que os containers ainda usam placeholder servers

Os placeholders continuam existindo, mas agora de forma melhor.

Antes:

- o container so ficava vivo com `tail -f /dev/null`
- nao havia endpoint real
- nao havia healthcheck verdadeiro para `api` e `function`

Agora:

- `api` responde em `http://localhost:3000`
- `api` responde healthcheck em `http://localhost:3000/health`
- `image-processor-function` responde em `http://localhost:7071`
- `image-processor-function` responde healthcheck em `http://localhost:7071/health`

Isso e melhor porque o container se comporta como servico, mesmo antes da aplicacao final existir.

## 5. Portas, volumes e credenciais locais

### Portas publicadas

- `5432`: PostgreSQL
- `10000`: Azurite Blob
- `10001`: Azurite Queue
- `10002`: Azurite Table
- `3000`: API
- `7071`: Azure Function local

### Volumes nomeados

- `postgres-data`: dados do banco
- `azurite-data`: dados do storage local

### Credenciais locais atuais

As credenciais iniciais estao em [`.env.example`](/home/alexandre/workspace/web-socket/.env.example):

- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_DB=image_pipeline`

### Sobre os hosts

O arquivo de ambiente agora separa host da maquina e host interno do Docker:

- `POSTGRES_HOST=localhost`
- `POSTGRES_CONTAINER_HOST=postgres`
- `AZURITE_HOST=127.0.0.1`
- `AZURITE_CONTAINER_HOST=azurite`
- `AZURITE_BLOB_ENDPOINT=http://127.0.0.1:10000/devstoreaccount1`
- `AZURITE_BLOB_ENDPOINT_DOCKER=http://azurite:10000/devstoreaccount1`
- `FUNCTION_WEBSOCKET_URL=ws://localhost:3000/processing`
- `FUNCTION_WEBSOCKET_URL_DOCKER=ws://api:3000/processing`

Isso foi feito porque o mesmo sistema enxerga enderecos diferentes:

- fora do Docker, usa `localhost`
- dentro do Docker, usa o nome do servico

Tambem foi ajustado o `DATABASE_URL` dentro dos containers para usar `postgres` em vez de `localhost`, o que e essencial para Prisma funcionar quando a API estiver pronta.

## 6. Validacao da rede

Foi criado o script [infra/scripts/validate-network.sh](/home/alexandre/workspace/web-socket/infra/scripts/validate-network.sh) para validar:

- `api -> postgres`
- `api -> azurite`
- `image-processor-function -> postgres`
- `image-processor-function -> azurite`

Por padrao, ele valida a stack de desenvolvimento:

- `docker-compose.yml`
- `docker-compose.dev.yml`

Mas tambem pode ser usado com outros arquivos Compose.

Essa validacao e importante porque, em sistemas distribuidos, uma parte grande dos problemas aparece antes mesmo da regra de negocio:

- DNS interno
- portas erradas
- dependencia subindo fora de ordem
- container acessivel da maquina mas nao de outro container

## 7. Como usar

### Subir modo base

```bash
docker compose up -d --build
```

Esse modo usa o `docker-compose.yml` sozinho e constroi as imagens com target `production`.

### Subir modo desenvolvimento

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Esse modo usa:

- bind mounts
- target `development`
- a mesma base estrutural do compose principal

### Validar a rede do modo desenvolvimento

```bash
sh infra/scripts/validate-network.sh
```

### Validar a rede de outro conjunto de arquivos Compose

```bash
sh infra/scripts/validate-network.sh -f docker-compose.yml
```

### Derrubar a stack

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## 8. Resultado da Fase 2

Ao final desta fase, o projeto passa a ter:

- stack local reproduzivel
- banco local persistente
- emulacao local do Azure Storage
- nomes de servico estaveis
- compose base e override de desenvolvimento
- Dockerfiles multistage para `production` e `development`
- healthchecks reais para `api`, `function` e `postgres`
- validacao pratica de rede entre os containers

Isso prepara o terreno para a Fase 3, onde a `api` deixa de ser placeholder e vira uma aplicacao NestJS real.
