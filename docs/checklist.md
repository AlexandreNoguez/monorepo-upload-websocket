# Checklist Do Projeto

Este checklist foi organizado para que você consiga estudar e implementar por partes, sem tentar resolver tudo de uma vez.

## Fase 1. Fundamentos do monorepo

- [x] Definir o gerenciador do monorepo
- [x] Criar estrutura inicial de pastas `apps`, `packages`, `infra`, `docs`
- [x] Criar `README.md` do projeto
- [x] Definir padrão de variáveis de ambiente
- [x] Definir convenção de nomes dos serviços e containers

## Fase 2. Infraestrutura local com Docker Compose para desenvolvimento

- [x] Criar `docker-compose.yml`
- [x] Subir container do `postgres`
- [x] Subir container do `azurite`
- [x] Subir container da `api`
- [x] Subir container da `azure function`
- [x] Validar rede interna entre containers
- [x] Documentar portas, volumes e credenciais locais

## Fase 3. Base da API NestJS

- [ ] Criar aplicação `NestJS`
- [ ] Configurar módulos base
- [ ] Criar estrutura por camadas: `domain`, `application`, `infrastructure`, `interfaces`
- [ ] Configurar validação de ambiente
- [ ] Configurar logging
- [ ] Criar endpoint de health check

## Fase 4. Prisma e PostgreSQL

- [ ] Inicializar Prisma
- [ ] Configurar conexão com PostgreSQL
- [ ] Modelar tabelas iniciais
- [ ] Gerar primeira migration
- [ ] Criar seed opcional para desenvolvimento
- [ ] Criar implementações de repositório com Prisma

## Fase 5. Modelagem do domínio

- [ ] Criar entidade `ImageAsset`
- [ ] Criar entidade `ProcessingJob`
- [ ] Criar entidade `ProcessedVariant`
- [ ] Criar value objects principais
- [ ] Definir enum de status do processamento
- [ ] Definir invariantes de transição de estado

## Fase 6. Casos de uso da API

- [ ] Implementar `SolicitarUploadDeImagem`
- [ ] Implementar `ConfirmarUploadRecebido`
- [ ] Implementar `IniciarProcessamentoDaImagem`
- [ ] Implementar `RegistrarProgressoDoProcessamento`
- [ ] Implementar `ConcluirProcessamentoComSucesso`
- [ ] Implementar `RegistrarFalhaDeProcessamento`
- [ ] Implementar `ConsultarStatusDaImagem`

## Fase 7. Blob Storage local com Azurite

- [ ] Configurar connection string do Azurite
- [ ] Criar containers/pastas lógicas de blob
- [ ] Definir estratégia de nomenclatura das chaves dos arquivos
- [ ] Testar upload manual de imagem
- [ ] Garantir que a API consiga montar referências corretas para o blob

## Fase 8. Azure Function em Python

- [ ] Criar projeto da Function
- [ ] Configurar `Blob Trigger`
- [ ] Ler a imagem do blob
- [ ] Extrair metadados básicos
- [ ] Gerar miniatura
- [ ] Gerar versão em escala de cinza
- [ ] Salvar artefatos processados no blob
- [ ] Tratar erros de arquivo inválido

## Fase 9. Protocolo WebSocket

- [ ] Definir eventos WebSocket
- [ ] Criar schema dos payloads
- [ ] Definir autenticação da Function no gateway
- [ ] Criar gateway WebSocket no NestJS
- [ ] Implementar cliente WebSocket na Function
- [ ] Testar envio de `processing.started`
- [ ] Testar envio de `processing.progress`
- [ ] Testar envio de `processing.completed`
- [ ] Testar envio de `processing.failed`

## Fase 10. Persistência do ciclo de vida

- [ ] Persistir início do processamento
- [ ] Persistir eventos intermediários
- [ ] Persistir resultado final
- [ ] Persistir falhas
- [ ] Persistir metadados extraídos
- [ ] Persistir variantes geradas

## Fase 11. Consulta e observabilidade

- [ ] Criar endpoint para consultar status da imagem
- [ ] Criar endpoint para listar processamentos
- [ ] Expor histórico resumido do job
- [ ] Criar logs úteis para upload e processamento
- [ ] Garantir rastreabilidade por `jobId` e `functionExecutionId`

## Fase 12. Testes

- [ ] Testar casos de uso em unidade
- [ ] Testar repositórios com banco local
- [ ] Testar fluxo de upload + processamento
- [ ] Testar falha de processamento
- [ ] Testar idempotência básica dos eventos
- [ ] Testar reconexão ou falha de comunicação WebSocket

## Fase 13. Documentação final do projeto

- [ ] Documentar arquitetura final
- [ ] Documentar fluxo end-to-end
- [ ] Documentar variáveis de ambiente
- [ ] Documentar como subir tudo localmente
- [ ] Documentar contratos WebSocket
- [ ] Documentar decisões arquiteturais

## Fase 14. Laboratório local com Kubernetes

- [x] Instalar e validar `kubectl`
- [ ] Instalar e validar `kind`
- [x] Criar configuração local do cluster `kind`
- [ ] Subir cluster local com namespace do projeto
- [x] Definir política de segurança mínima para o namespace
- [x] Documentar o fluxo local com `kubectl` e `kind`

## Fase 15. Manifests Kubernetes do projeto

- [x] Criar estrutura `infra/k8s/base`
- [x] Criar estrutura `infra/k8s/overlays/local-kind`
- [ ] Criar `Deployment` e `Service` da `api`
- [ ] Criar `Deployment` e `Service` do `image-processor-function`
- [ ] Criar recursos para `postgres` local de estudo
- [ ] Criar recursos para `azurite` local de estudo
- [ ] Criar `ConfigMap` e `Secret` de exemplo
- [ ] Validar deploy local com `kubectl apply -k`

## Fase 16. Trilha AWS

- [ ] Definir arquitetura alvo na AWS
- [ ] Definir estratégia de imagens com Amazon ECR
- [ ] Definir estratégia de cluster com Amazon EKS
- [ ] Definir estratégia de banco com Amazon RDS for PostgreSQL
- [ ] Definir estratégia de storage com Amazon S3
- [ ] Documentar tutorial iniciante de provisionamento
- [ ] Documentar cuidados de custo e segurança

## Critérios de pronto do MVP

- [ ] Usuário consegue subir uma imagem
- [ ] A imagem chega ao blob local
- [ ] A Function é disparada automaticamente
- [ ] A Function gera pelo menos uma variante derivada
- [ ] A Function informa progresso via WebSocket
- [ ] O backend persiste os eventos no banco
- [ ] O backend retorna status final consistente
- [ ] O fluxo de erro também fica registrado

## Ordem recomendada para construir sem se perder

1. Docker + Postgres + Azurite
2. NestJS base
3. Prisma
4. Domínio e casos de uso
5. Upload
6. Function
7. WebSocket
8. Persistência de progresso
9. Testes
10. Refinos
