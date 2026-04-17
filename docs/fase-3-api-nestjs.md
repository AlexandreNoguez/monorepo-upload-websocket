# Fase 3: Base Da API NestJS

Esta fase cria a primeira versao real da API NestJS.

## 1. Objetivo

O objetivo foi substituir o placeholder conceitual por uma aplicacao NestJS organizada desde o inicio para Clean Architecture.

Isso significa que a API ja nasce separando:

- `domain`
- `application`
- `infrastructure`
- `presentation`

Essa separacao evita que controllers, banco, framework e regra de negocio fiquem misturados.

## 2. O que foi criado

- [apps/api/package.json](/home/alexandre/workspace/web-socket/apps/api/package.json)
- [apps/api/nest-cli.json](/home/alexandre/workspace/web-socket/apps/api/nest-cli.json)
- [apps/api/tsconfig.json](/home/alexandre/workspace/web-socket/apps/api/tsconfig.json)
- [apps/api/src/main.ts](/home/alexandre/workspace/web-socket/apps/api/src/main.ts)
- [apps/api/src/app.module.ts](/home/alexandre/workspace/web-socket/apps/api/src/app.module.ts)
- [apps/api/src/infrastructure/config/application-config.ts](/home/alexandre/workspace/web-socket/apps/api/src/infrastructure/config/application-config.ts)
- [apps/api/src/presentation/http/health/health.controller.ts](/home/alexandre/workspace/web-socket/apps/api/src/presentation/http/health/health.controller.ts)
- [infra/docker/api/Dockerfile](/home/alexandre/workspace/web-socket/infra/docker/api/Dockerfile)

## 3. Por que criar as camadas agora

Criar as camadas antes dos casos de uso parece um pouco mais trabalhoso no inicio, mas evita reorganizacao dolorosa depois.

O papel de cada camada sera:

- `domain`: entidades, value objects e regras puras
- `application`: casos de uso, DTOs de aplicacao e portas
- `infrastructure`: Prisma, storage, config, logging e implementacoes externas
- `presentation`: HTTP controllers, WebSocket gateways e entradas do sistema

## 4. Por que o health check ficou fora do prefixo

A API tera prefixo global, como `/api`.

Mesmo assim, o health check fica em:

```bash
/health
```

Isso foi intencional para manter compatibilidade com:

- Docker healthcheck
- Kubernetes readiness probe
- Kubernetes liveness probe

Health check costuma ser infraestrutura, nao recurso de negocio.

## 5. Por que validar ambiente sem biblioteca externa agora

Nesta etapa, a validacao de ambiente foi criada de forma simples em codigo TypeScript.

Isso evita adicionar complexidade antes da hora.

Mais tarde, quando as variaveis crescerem, podemos avaliar:

- `zod`
- `joi`
- `class-validator`

Por enquanto, a API ja valida:

- porta
- runtime
- prefixo
- nome do servico

## 6. Padrao de nomes no codigo

O codigo foi escrito com nomes descritivos.

Em vez de nomes como `e`, `s`, `cfg` ou `res`, usamos nomes como:

- `environmentVariables`
- `rawEnvironmentValue`
- `normalizedRuntimeEnvironment`
- `applicationConfig`
- `getHealthStatusUseCase`

Isso deixa o projeto melhor para estudo e reduz ambiguidade.

## 7. Como executar quando as dependencias estiverem instaladas

```bash
pnpm install
pnpm api:start:dev
```

Depois:

```bash
curl http://localhost:3000/health
```

## 8. Resultado desta fase

Ao final desta fase, a API passa a ter:

- estrutura NestJS real
- camadas iniciais de Clean Architecture
- validacao de ambiente
- logging basico
- health check
- Dockerfile apontando para a aplicacao real
