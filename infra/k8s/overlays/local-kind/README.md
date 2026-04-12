# Overlay Local kind

Este overlay sera usado para o cluster local de estudo com `kind`.

Aqui entra o que for especifico do laboratorio local:

- tags de imagem locais
- configuracoes de replicas para estudo
- ajustes de acesso local

Arquivo inicial:

- [kustomization.yaml](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/kustomization.yaml)

Responsabilidades atuais:

- definir namespace `web-socket`
- apontar imagens para tags locais
- usar `imagePullPolicy: Never` no laboratorio `kind`
