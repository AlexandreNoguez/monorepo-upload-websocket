# Kubernetes

Esta pasta vai concentrar a orquestracao principal do projeto.

Direcao adotada:

- `docker compose` fica restrito ao desenvolvimento local
- `infra/k8s` vira a fonte de verdade da orquestracao
- `Kustomize` sera o primeiro mecanismo de composicao

Estrutura prevista:

- `base`: manifests compartilhados
- `overlays/local-kind`: ambiente local de estudo
- `overlays/aws`: ambiente alvo na AWS
- `kind`: artefatos e referencias do laboratorio local

Primeiros artefatos ja criados:

- namespace base com seguranca minima
- `kustomization.yaml` para `base`
- `kustomization.yaml` para `local-kind`
- `kustomization.yaml` para `aws`
