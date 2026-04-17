# Backend NestJS + Azure Functions + WebSocket

Este repositório vai servir como laboratório e base de estudo para um sistema com:

- `NestJS` no backend principal
- `Clean Architecture` + `DDD`
- `WebSocket` para comunicação em tempo real entre backend e processamento
- `Azure Functions (Python)` para processar imagens
- `Azure Blob Storage` com `Azurite` para ambiente local
- `PostgreSQL` como banco relacional
- `Prisma` como ORM
- `Docker` e `docker compose` para subir tudo localmente

## Objetivo do projeto

O fluxo que vamos construir é:

1. O cliente envia uma imagem.
2. O backend registra a intenção de upload e persiste o estado inicial.
3. A imagem é salva no Blob Storage.
4. A Azure Function é acionada quando o blob é criado.
5. A Function processa a imagem.
6. Durante o processamento, a Function envia eventos via WebSocket para o backend.
7. O backend persiste cada mudança de estado no PostgreSQL.
8. No final, o backend guarda o resultado do processamento e pode notificar clientes em tempo real.

## Documentação

- [Arquitetura e plano do projeto](/home/alexandre/workspace/web-socket/docs/architecture.md)
- [Checklist por etapas](/home/alexandre/workspace/web-socket/docs/checklist.md)
- [Fundação da Fase 1](/home/alexandre/workspace/web-socket/docs/fase-1-fundacao.md)
- [Infraestrutura local da Fase 2](/home/alexandre/workspace/web-socket/docs/fase-2-infra-local.md)
- [Base da API NestJS da Fase 3](/home/alexandre/workspace/web-socket/docs/fase-3-api-nestjs.md)
- [Preparação do ambiente de desenvolvimento](/home/alexandre/workspace/web-socket/docs/development-environment-setup.md)
- [Plano de migração para Kubernetes](/home/alexandre/workspace/web-socket/docs/kubernetes-migration.md)
- [Guia iniciante de Kubernetes](/home/alexandre/workspace/web-socket/docs/kubernetes-beginner-guide.md)
- [Tutorial do laboratório local com kind](/home/alexandre/workspace/web-socket/docs/local-kind-tutorial.md)
- [Registro da Fase 14](/home/alexandre/workspace/web-socket/docs/fase-14-laboratorio-kind.md)
- [Registro da Fase 15](/home/alexandre/workspace/web-socket/docs/fase-15-workloads-k8s.md)
- [Guia iniciante de AWS](/home/alexandre/workspace/web-socket/docs/aws-beginner-guide.md)
- [Convenções iniciais](/home/alexandre/workspace/web-socket/docs/conventions.md)

## Resultado esperado

Ao final, teremos um monorepo com pelo menos estes blocos:

- `apps/api`: backend NestJS
- `apps/image-processor-function`: Azure Function em Python
- `packages/shared`: contratos, schemas e convenções compartilhadas
- `infra`: Docker, compose, scripts e bootstrap local
- `docs`: documentação de estudo e execução

## Decisão funcional para o processamento da imagem

Para tornar o projeto concreto e útil para estudo, a Function vai:

1. Ler a imagem enviada.
2. Extrair metadados básicos como nome, tamanho e dimensões.
3. Gerar uma versão processada da imagem.
4. Salvar a imagem processada em outro container/pasta do blob.
5. Informar ao backend os eventos de progresso, sucesso ou falha.
6. Permitir que o backend persista histórico e estado final no banco.

Uma escolha simples e boa para começar é:

- gerar uma miniatura (`thumbnail`)
- gerar uma versão em escala de cinza
- salvar metadados técnicos da imagem

Isso é bom para estudo porque:

- é visual
- permite vários estados de processamento
- exige persistência
- combina bem com eventos em tempo real

## Como usar este repositório agora

Neste momento, o repositório contém a documentação-base do projeto. O próximo passo natural é começar a fase 1 do checklist e subir a estrutura inicial do monorepo.

## Status atual

A Fase 1 do checklist foi iniciada com:

- definição do gerenciador do monorepo
- criação da estrutura inicial de pastas
- padronização inicial de variáveis de ambiente
- definição de convenções de nomes

A Fase 2 adiciona:

- `docker-compose.yml`
- `docker-compose.dev.yml`
- containers locais para `postgres`, `azurite`, `api` e `image-processor-function`
- Dockerfiles multistage para desenvolvimento e produção
- documentação operacional da stack local

O próximo ciclo do projeto será:

- `docker compose` apenas para desenvolvimento local
- `kind` para laboratório local de Kubernetes
- `infra/k8s` para manifests e overlays
- `AWS` como referência de destino em cloud

O laboratório Kubernetes agora já inclui:

- workloads da `api` e da `image-processor-function`
- `ConfigMap` e `Secret` gerados a partir de arquivos `.env`
- `postgres` via `StatefulSet`
- `azurite` com volume persistente

A Fase 3 inicia a API real com:

- aplicação NestJS em `apps/api`
- estrutura inicial de Clean Architecture
- health check em `/health`
- validação básica de ambiente
- logging de bootstrap
