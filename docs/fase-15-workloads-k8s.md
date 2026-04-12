# Fase 15: Workloads E Dependencias No Kubernetes

Esta fase deixou de ser apenas "primeiros pods da aplicacao" e passou a representar o primeiro desenho coerente do sistema dentro do cluster.

Agora temos:

- `Deployment` e `Service` da `api`
- `Deployment` e `Service` do `image-processor-function`
- `ConfigMap` gerado a partir de `.env`
- `Secret` local gerado a partir de `.env`
- `StatefulSet` e `Service` do `postgres`
- `Deployment`, `Service` e `PVC` do `azurite`

## 1. Objetivo

O objetivo desta fase e sair de "tenho namespace e dois pods de exemplo" para "tenho um pequeno sistema orquestrado no cluster".

Isso e importante porque, daqui para frente, quase tudo do projeto depende destas ideias:

- a API depende de rede estavel
- a Function depende de configuracao
- a aplicacao depende de banco
- o fluxo de upload depende de storage

Se a gente pulasse direto para NestJS real, Prisma real e Azure Function real, o estudo ficaria mais dificil porque os conceitos de Kubernetes ficariam escondidos no meio da logica da aplicacao.

## 2. O que foi criado

### Aplicacao

- [infra/k8s/base/api-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-deployment.yaml)
- [infra/k8s/base/api-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-service.yaml)
- [infra/k8s/base/image-processor-function-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-deployment.yaml)
- [infra/k8s/base/image-processor-function-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-service.yaml)

### Configuracao

- [infra/k8s/overlays/local-kind/app-config.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-config.env.example)
- [infra/k8s/overlays/local-kind/app-secrets.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-secrets.env.example)

### Dependencias locais do cluster

- [infra/k8s/base/postgres-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/postgres-service.yaml)
- [infra/k8s/base/postgres-statefulset.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/postgres-statefulset.yaml)
- [infra/k8s/base/azurite-pvc.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-pvc.yaml)
- [infra/k8s/base/azurite-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-deployment.yaml)
- [infra/k8s/base/azurite-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-service.yaml)

### Composicao

- [infra/k8s/base/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/kustomization.yaml)
- [infra/k8s/overlays/local-kind/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/kustomization.yaml)
- [infra/scripts/kind-load-images.sh](/home/alexandre/workspace/web-socket/infra/scripts/kind-load-images.sh)

## 3. Por que cada recurso existe

### `Deployment`

Usamos `Deployment` para a `api`, para a `image-processor-function` e para o `azurite` porque queremos:

- rollout controlado
- substituicao automatica de pods
- declaracao simples de replicas

No caso do `azurite`, apesar de ele guardar dados em volume, o processo em si nao precisa da semantica de identidade estavel de um banco.

### `StatefulSet`

Usamos `StatefulSet` para o `postgres` porque banco e um caso classico de workload stateful.

O motivo nao e "porque o Kubernetes exige", e sim porque esse objeto modela melhor o problema:

- identidade de pod mais previsivel
- acoplamento mais claro com armazenamento persistente
- comportamento mais apropriado para servicos stateful

Uma alternativa mais simples seria usar `Deployment` com `PVC`. Isso poderia funcionar no laboratorio, mas ensina um modelo menos adequado para banco.

### `Service`

Usamos `Service` para dar um endereco estavel a cada dependencia:

- `api`
- `image-processor-function`
- `postgres`
- `azurite`

Isso importa porque pods mudam de IP quando sao recriados. O `Service` abstrai esse detalhe.

### `ConfigMap`

O objeto `app-config` continua existindo no cluster, mas agora ele e gerado pelo `Kustomize` a partir de [app-config.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-config.env.example).

Esse arquivo guarda dados que nao sao sensiveis, como:

- hosts
- portas
- nomes de containers de storage
- URL interna do WebSocket

Isso ajuda a ensinar uma ideia essencial do Kubernetes: configuracao nao deve ficar hardcoded dentro da imagem nem espalhada em YAML quando pode variar por ambiente.

### `Secret`

O objeto `app-secrets` tambem continua existindo no cluster, mas agora ele e gerado pelo `Kustomize` a partir de [app-secrets.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-secrets.env.example).

Ele guarda:

- usuario e senha do banco
- `DATABASE_URL`
- segredo compartilhado da Function
- connection string do Azurite

Importante: este `Secret` existe para estudo local. Em producao, o ideal seria usar um gerenciador proprio da nuvem, como AWS Secrets Manager.

### `PersistentVolumeClaim`

O `PVC` do Azurite e o `volumeClaimTemplates` do PostgreSQL existem para que dados nao desaparecam sempre que o processo reiniciar.

Se a gente deixasse tudo em filesystem efemero do container:

- o banco perderia dados
- o storage emulado perderia blobs
- o laboratorio ficaria pouco realista

## 4. Por que usar arquivos `.env` no overlay

Eu mudei a estrategia em relacao a etapa anterior.

Antes, os valores estavam declarados em YAML. Agora, o overlay local gera `ConfigMap` e `Secret` a partir de arquivos `.env`.

O motivo dessa mudanca e simples:

- deixa os manifests mais limpos
- aproxima o estudo de um fluxo mais comum em projetos reais
- facilita trocar valores sem editar o manifesto do workload
- permite manter exemplos versionados e arquivos reais fora do Git

Os arquivos versionados para estudo sao:

- [infra/k8s/overlays/local-kind/app-config.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-config.env.example)
- [infra/k8s/overlays/local-kind/app-secrets.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-secrets.env.example)

Os arquivos reais usados pelo `Kustomize` sao:

- `infra/k8s/overlays/local-kind/app-config.env`
- `infra/k8s/overlays/local-kind/app-secrets.env`

Esses arquivos reais sao criados automaticamente por [k8s-prepare-local-env.sh](/home/alexandre/workspace/web-socket/infra/scripts/k8s-prepare-local-env.sh) quando ainda nao existem.

Essa separacao continua muito boa para estudo.

O que e comum entre ambientes continua ficando na base como referencia de arquitetura:

- portas
- nomes de servico
- nomes logicos de containers

O que depende do ambiente continua ficando no overlay:

- credenciais
- tokens
- segredos
- connection strings especificas

Essa divisao prepara voce, desde ja, para pensar em `local-kind`, `aws` e outros ambientes sem duplicar tudo.

## 5. Por que os YAMLs agora estao comentados

Nesta etapa eu coloquei comentarios inline diretamente nos manifests do Kubernetes.

A motivacao e didatica:

- YAML de Kubernetes costuma assustar no comeco
- a sintaxe parece simples, mas cada campo tem um papel importante
- comentar o arquivo perto da declaracao ajuda a estudar mais rapido do que ficar alternando entre manifesto e documentacao externa

Entao a ideia foi transformar os manifests em "codigo + explicacao" ao mesmo tempo.

## 6. Como usar localmente quando `kind` estiver instalado

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
sh infra/scripts/kind-create-cluster.sh
sh infra/scripts/kind-load-images.sh
sh infra/scripts/k8s-prepare-local-env.sh
sh infra/scripts/k8s-apply-local-kind.sh
kubectl get deployments -n web-socket
kubectl get statefulsets -n web-socket
kubectl get services -n web-socket
kubectl get pvc -n web-socket
kubectl get pods -n web-socket
```

## 7. O que esperar depois do apply

Depois de aplicar o overlay local, o cluster deve passar a ter:

- a `api`
- a `image-processor-function`
- o `postgres`
- o `azurite`
- um `ConfigMap` gerado a partir de `.env`
- um `Secret` gerado a partir de `.env`
- volumes persistentes locais

Ou seja: mesmo que a aplicacao real ainda nao exista, o desenho operacional principal do projeto ja comeca a aparecer.

## 8. Validacoes feitas nesta etapa

Nesta etapa foi possivel validar localmente:

- renderizacao completa do `Kustomize`
- coerencia entre base e overlay
- reescrita das imagens da aplicacao para o cluster `kind`

Ainda nao foi possivel validar deploy real no cluster nesta maquina porque o `kind` continua nao instalado no ambiente atual.

## 9. Resultado

Ao final desta fase, o projeto deixa de ter apenas "pods de exemplo" e passa a ter uma primeira topologia completa de laboratorio no Kubernetes.
