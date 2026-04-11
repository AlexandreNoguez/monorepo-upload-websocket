# Plano De Migracao Para Kubernetes

Este documento transforma a decisao arquitetural em plano executavel.

O objetivo e simples:

- manter `docker compose` apenas para desenvolvimento local
- usar `kind` para estudar Kubernetes localmente
- preparar o repositorio para um futuro deploy em AWS

## 1. Estado atual

Hoje o repositorio ja possui:

- monorepo organizado
- Dockerfiles multistage
- stack local com `postgres`, `azurite`, `api` e `image-processor-function`
- healthchecks e validacao de rede

Isso significa que a parte mais importante para Kubernetes ja existe:

- imagens podem ser geradas
- servicos ja possuem identidade
- a rede entre servicos ja foi pensada

## 2. O que muda com Kubernetes

Em `docker compose`, o foco e:

- desenvolvimento
- bind mounts
- subir tudo rapidamente

Em Kubernetes, o foco muda para:

- workloads declarativos
- escalabilidade
- rede por servico
- readiness e liveness
- configuracao por manifests

Entao a migracao nao e “trocar Docker por Kubernetes”.

Ela e, na verdade:

- manter Docker como mecanismo de build
- trocar o orquestrador

## 3. Regra central da migracao

Daqui para frente:

- `Dockerfile` continua como fonte da imagem
- `docker compose` continua como ferramenta de dev local
- `infra/k8s` vira a fonte de verdade da orquestracao

## 4. Estrutura sugerida

```text
infra/
├── docker/
├── compose/
├── scripts/
└── k8s/
    ├── README.md
    ├── kind/
    │   └── README.md
    ├── base/
    │   ├── README.md
    │   └── .gitkeep
    └── overlays/
        ├── local-kind/
        │   ├── README.md
        │   └── .gitkeep
        └── aws/
            ├── README.md
            └── .gitkeep
```

## 5. Ordem recomendada de implementacao

### Etapa 1. Laboratorio local seguro

Primeiro vamos montar o ambiente local com:

- `kubectl`
- `kind`
- namespace do projeto
- configuracao minima de seguranca

Por que isso vem primeiro?

Porque aprender Kubernetes sem cluster local proprio gera duas dores:

- pouco espaco para errar
- dependencia desnecessaria de cloud

### Etapa 2. Manifestos base

Depois criamos os manifests base:

- `Namespace`
- `ConfigMap`
- `Secret` de exemplo
- `Deployment`
- `Service`

### Etapa 3. Overlay local

Depois criamos o overlay `local-kind` para ajustar:

- tags de imagem locais
- replicas
- configuracao de estudo
- possiveis `port-forward`s e acesso local

### Etapa 4. Banco e object storage no cluster local

Para estudo local, vamos ter manifests tambem para:

- `postgres`
- `azurite`

Isto nao significa que em producao faremos igual.

Isso existe porque o objetivo aqui e aprender o ecossistema inteiro localmente.

### Etapa 5. Overlay AWS

Por ultimo, documentamos e depois implementamos a versao conceitual da AWS:

- `api` e `image-processor-function` no `Amazon EKS`
- imagens no `Amazon ECR`
- banco no `Amazon RDS for PostgreSQL`
- arquivos no `Amazon S3`

## 6. Mapeamento Compose -> Kubernetes

### `api`

No Compose:

- um servico com porta e healthcheck

No Kubernetes:

- `Deployment`
- `Service`

### `image-processor-function`

No Compose:

- um servico com porta e healthcheck

No Kubernetes:

- `Deployment`
- `Service`

No futuro, dependendo da estrategia de processamento, ele tambem pode virar:

- `Job`
- `CronJob`
- worker de fila

### `postgres`

No Compose:

- container com volume nomeado

No Kubernetes local:

- `StatefulSet` ou `Deployment` de estudo com `PersistentVolumeClaim`

Na AWS:

- `Amazon RDS for PostgreSQL`

### `azurite`

No Compose:

- container com volume nomeado

No Kubernetes local:

- `Deployment`
- `Service`

Na AWS:

- `Amazon S3`

## 7. Decisao importante sobre a AWS

Para a AWS, a recomendacao principal deste projeto e:

- usar Kubernetes para `api`
- usar Kubernetes para o processador
- usar servicos gerenciados para estado

Em termos praticos:

- `EKS` para compute
- `RDS` para PostgreSQL
- `S3` para object storage
- `ECR` para imagens

## 8. Quando nao migrar tudo de uma vez

A pior forma de estudar essa trilha seria tentar:

- aprender Kubernetes
- aprender EKS
- aprender IAM
- aprender manifests
- aprender rede

tudo no mesmo dia.

Por isso, o projeto vai seguir esta estrategia:

1. cluster local
2. manifests locais
3. entendimento de servicos
4. tutorial AWS
5. so depois adaptacao real para cloud

## 9. Resultado esperado da migracao

No fim dessa trilha, o repositorio vai ter dois papeis bem claros:

- `compose`: ambiente local de desenvolvimento
- `k8s`: modelo real de execucao

Isso reduz confusao e deixa o aprendizado muito mais limpo.
