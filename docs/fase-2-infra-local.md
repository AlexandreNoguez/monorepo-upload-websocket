# Fase 2: Infraestrutura Local Com Docker

Este documento registra o que foi feito na Fase 2 e explica:

- como a stack local foi montada
- por que cada servico existe
- por que os containers de `api` e `image-processor-function` ainda sao placeholders
- quais seriam alternativas mais maduras

## 1. O que foi criado

Arquivos principais:

- [docker-compose.yml](/home/alexandre/workspace/web-socket/docker-compose.yml)
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

Neste momento e um container de desenvolvimento para o futuro app NestJS.

Ele ainda nao sobe NestJS de verdade. Isso foi intencional.

Por que fazer assim?

- a Fase 2 e sobre infraestrutura base, nao sobre aplicacao
- ainda nao criamos o app NestJS da Fase 3
- mesmo assim, ja queremos reservar a identidade do servico, a porta e a rede

### `image-processor-function`

Neste momento e um container de desenvolvimento para a futura Azure Function.

Ele ainda nao sobe Functions Host real. Isso tambem foi intencional.

Por que fazer assim?

- a Function so sera implementada de verdade mais adiante
- mesmo sem codigo funcional, ja queremos validar o papel do servico no ambiente
- isso antecipa a rede, os mounts e a convencao de nomes sem inventar codigo cedo demais

## 3. Por que usar placeholders para `api` e `image-processor-function`

Essa e uma das decisoes mais importantes da Fase 2.

Se tentassemos subir NestJS e Azure Functions reais agora, cairiamos em dois problemas:

- criariamos codigo de aplicacao antes da Fase 3
- misturariamos infraestrutura com implementacao de negocio

Com placeholders:

- a Fase 2 continua focada em ambiente
- a Fase 3 continua focada em app NestJS
- a Fase 8 continua focada em Azure Functions

Isso parece mais lento, mas na pratica reduz bagunca.

## 4. Portas, volumes e credenciais locais

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
- `FUNCTION_WEBSOCKET_URL=ws://localhost:3000/processing`
- `FUNCTION_WEBSOCKET_URL_DOCKER=ws://api:3000/processing`

Isso foi feito porque o mesmo sistema enxerga enderecos diferentes:

- fora do Docker, usa `localhost`
- dentro do Docker, usa o nome do servico

## 5. Validacao da rede

Foi criado o script [infra/scripts/validate-network.sh](/home/alexandre/workspace/web-socket/infra/scripts/validate-network.sh) para validar:

- `api -> postgres`
- `api -> azurite`
- `image-processor-function -> postgres`
- `image-processor-function -> azurite`

Essa validacao e importante porque, em sistemas distribuidos, uma parte grande dos problemas aparece antes mesmo da regra de negocio:

- DNS interno
- portas erradas
- dependencia subindo fora de ordem
- container acessivel da maquina mas nao de outro container

## 6. Haveria maneiras melhores de fazer?

Sim, dependendo do momento do projeto.

### Melhor para um projeto mais maduro

- usar `docker compose override` para desenvolvimento
- subir NestJS real com hot reload
- subir Azure Functions Host real
- separar arquivos `.env` por servico
- adicionar healthchecks tambem para `api` e `function`

### Melhor para um time maior

- usar `Tilt`, `Dev Containers` ou `Skaffold`
- padronizar scripts de bootstrap
- usar imagens mais proximas da producao

### Por que nao fizemos isso agora

Porque ainda estamos construindo entendimento. Se trouxermos toda a sofisticacao agora, o estudo perde foco.

## 7. Resultado da Fase 2

Ao final desta fase, o projeto passa a ter:

- stack local reproduzivel
- banco local persistente
- emulacao local do Azure Storage
- nomes de servico estaveis
- validacao pratica de rede entre os containers

Isso prepara o terreno para a Fase 3, onde a `api` deixa de ser placeholder e vira uma aplicacao NestJS real.
