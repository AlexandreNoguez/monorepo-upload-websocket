# Fase 15: Primeiros Workloads Kubernetes

Esta etapa introduz os primeiros workloads reais do projeto no Kubernetes:

- `Deployment` da `api`
- `Service` da `api`
- `Deployment` do `image-processor-function`
- `Service` do `image-processor-function`

## 1. Objetivo

O objetivo desta fase e sair da etapa "so namespace" e entrar na etapa "servicos reais no cluster".

Ainda nao estamos colocando:

- `postgres`
- `azurite`
- `ConfigMap`
- `Secret`

Porque a ideia aqui e subir a complexidade por camadas.

## 2. O que foi criado

- [infra/k8s/base/api-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-deployment.yaml)
- [infra/k8s/base/api-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-service.yaml)
- [infra/k8s/base/image-processor-function-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-deployment.yaml)
- [infra/k8s/base/image-processor-function-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-service.yaml)
- [infra/k8s/overlays/local-kind/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/kustomization.yaml)
- [infra/scripts/kind-load-images.sh](/home/alexandre/workspace/web-socket/infra/scripts/kind-load-images.sh)

## 3. Por que `Deployment` e `Service`

### `Deployment`

O `Deployment` representa o workload gerenciado.

Ele cuida de:

- replicas
- rollout
- gerenciamento dos pods

### `Service`

O `Service` da uma identidade de rede estavel para os pods.

Isso e importante porque pods podem morrer e ser recriados. O `Service` evita que voce dependa do IP do pod.

## 4. Por que usar placeholder servers ainda

Mesmo no Kubernetes, ainda estamos usando os placeholder servers HTTP.

Isso continua correto neste momento porque:

- a Fase 3 do NestJS ainda nao foi implementada
- a Azure Function real ainda nao foi implementada
- queremos estudar a orquestracao antes da aplicacao final

## 5. O que o overlay `local-kind` faz

O overlay local faz tres coisas importantes:

- define o namespace `web-socket`
- reescreve imagens para tags locais
- troca `imagePullPolicy` para `Never`

## 6. Como usar quando `kind` estiver instalado

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build
sh infra/scripts/kind-create-cluster.sh
sh infra/scripts/kind-load-images.sh
sh infra/scripts/k8s-apply-local-kind.sh
kubectl get deployments -n web-socket
kubectl get services -n web-socket
kubectl get pods -n web-socket
```

## 7. Validacoes feitas nesta etapa

Nesta etapa foi possivel validar localmente:

- renderizacao do `Kustomize`
- consistencia estrutural dos manifests com `kubectl --dry-run=client`

Ainda nao foi possivel validar deploy real no cluster porque `kind` ainda nao esta instalado nesta maquina.

## 8. Resultado

Ao final desta fase, o projeto passa a ter os dois primeiros workloads reais no Kubernetes.
