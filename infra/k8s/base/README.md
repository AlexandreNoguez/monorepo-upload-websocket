# Kubernetes Base

Aqui ficarao os manifests base do projeto, independentes de ambiente.

Exemplos futuros:

- namespace
- deployments
- services
- referencias a configuracao gerada por overlay

Arquivos iniciais:

- [namespace.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/namespace.yaml)
- [kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/kustomization.yaml)
- [api-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-deployment.yaml)
- [api-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/api-service.yaml)
- [image-processor-function-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-deployment.yaml)
- [image-processor-function-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/image-processor-function-service.yaml)
- [postgres-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/postgres-service.yaml)
- [postgres-statefulset.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/postgres-statefulset.yaml)
- [azurite-pvc.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-pvc.yaml)
- [azurite-deployment.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-deployment.yaml)
- [azurite-service.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/azurite-service.yaml)

Observacao:

- o `base` nao define valores concretos de ambiente
- `ConfigMap` e `Secret` sao gerados pelos overlays a partir de arquivos `.env`
