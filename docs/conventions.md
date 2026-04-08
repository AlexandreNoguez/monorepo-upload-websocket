# Convencoes Iniciais

## Nomes de pastas

- apps em `kebab-case`
- packages em `kebab-case`
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

- preferir `service names` curtos e descritivos
- evitar `container_name` fixo por padrao
- usar `COMPOSE_PROJECT_NAME` para padronizar o ambiente local
