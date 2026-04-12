# Fase 14: Laboratorio Local Com kind

Este documento registra o que foi feito para iniciar a trilha Kubernetes local do projeto.

## 1. Objetivo desta fase

A Fase 14 existe para preparar um laboratorio Kubernetes local que seja:

- gratuito
- controlado
- reproduzivel
- seguro o suficiente para estudo

O foco aqui nao e deploy de aplicacao ainda. O foco e preparar o terreno.

## 2. O que foi feito nesta etapa

### Artefatos criados

- [infra/k8s/base/namespace.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/namespace.yaml)
- [infra/k8s/base/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/kustomization.yaml)
- [infra/k8s/overlays/local-kind/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/kustomization.yaml)
- [infra/k8s/overlays/aws/kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/overlays/aws/kustomization.yaml)
- [infra/scripts/k8s-preflight.sh](/home/alexandre/workspace/web-socket/infra/scripts/k8s-preflight.sh)
- [infra/scripts/kind-create-cluster.sh](/home/alexandre/workspace/web-socket/infra/scripts/kind-create-cluster.sh)
- [infra/scripts/kind-delete-cluster.sh](/home/alexandre/workspace/web-socket/infra/scripts/kind-delete-cluster.sh)
- [infra/scripts/k8s-apply-local-kind.sh](/home/alexandre/workspace/web-socket/infra/scripts/k8s-apply-local-kind.sh)

## 3. Por que isso era necessario

Antes desta etapa, a trilha Kubernetes estava documentada, mas ainda muito conceitual.

Agora o repositorio ja possui:

- manifest base do namespace
- politica minima de seguranca por labels de namespace
- overlays iniciais validos com `Kustomize`
- scripts para verificar ferramentas e operar o laboratorio

## 4. Namespace e seguranca minima

O arquivo [infra/k8s/base/namespace.yaml](/home/alexandre/workspace/web-socket/infra/k8s/base/namespace.yaml) cria o namespace `web-socket` com labels de `Pod Security Admission` em `baseline`.

Para iniciantes, `baseline` e um ponto de equilibrio bom porque:

- ja bloqueia praticas mais arriscadas
- ainda nao e tao restritivo quanto `restricted`
- ajuda a estudar seguranca sem travar tudo cedo demais

## 5. O que foi validado

Nesta maquina foi possivel validar:

- `kubectl` instalado
- `Kustomize` disponivel via `kubectl`

Tambem foi identificado que:

- `kind` ainda nao esta instalado

## 6. Como usar agora

```bash
sh infra/scripts/k8s-preflight.sh
sh infra/scripts/kind-create-cluster.sh
sh infra/scripts/k8s-apply-local-kind.sh
sh infra/scripts/kind-delete-cluster.sh
```

## 7. Resultado desta etapa

Ao final, o projeto deixa de ter apenas uma ideia de laboratorio Kubernetes e passa a ter:

- base de namespace
- seguranca minima inicial
- overlays validos
- scripts operacionais
- documentacao do fluxo
