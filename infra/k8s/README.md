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
