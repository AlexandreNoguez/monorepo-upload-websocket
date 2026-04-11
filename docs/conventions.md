# Convencoes Iniciais

## Nomes de pastas

- apps em `kebab-case`
- packages em `kebab-case`
- diretórios de infraestrutura agrupados em `infra/docker` e `infra/k8s`
- arquivos de documentacao em nomes descritivos

## Nomes logicos de servicos

- `api`
- `image-processor-function`
- `postgres`
- `azurite`

## Prefixos de variaveis de ambiente

- `POSTGRES_*`
- `API_*`
- `AZURITE_*`
- `AZURE_STORAGE_*`
- `FUNCTION_*`

## Regra recomendada para Docker Compose

- `docker compose` existe apenas para desenvolvimento local
- preferir `service names` curtos e descritivos
- evitar `container_name` fixo por padrao
- usar `COMPOSE_PROJECT_NAME` para padronizar o ambiente local

## Regra recomendada para Kubernetes

- manifests base em `infra/k8s/base`
- ambientes em `infra/k8s/overlays/<ambiente>`
- usar `Kustomize` no inicio
- deixar `Helm` para uma etapa posterior
