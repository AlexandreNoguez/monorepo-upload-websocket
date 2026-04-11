# Tutorial Do Laboratorio Local Com kind

Este tutorial foi escrito para estudar Kubernetes localmente com ferramentas gratuitas e com baixo risco para a maquina.

## 1. Objetivo

Queremos montar um laboratorio local com:

- `Docker`
- `kubectl`
- `kind`
- `Kustomize` via `kubectl -k`

Sem depender de cloud, sem expor servicos publicamente e sem montar diretórios pessoais de forma perigosa.

## 2. O que e seguro nesta abordagem

Esta trilha e relativamente segura porque:

- o cluster roda localmente
- o `kind` usa containers Docker como nodes
- o repositorio continua isolado no workspace
- nao vamos usar `hostPath`
- nao vamos usar workloads privilegiados por padrao

### Cuidados praticos

- nao monte sua pasta `/home` inteira em containers
- use apenas este repositorio como contexto de trabalho
- prefira `kubectl port-forward` quando possivel
- mantenha secrets locais fora do Git

## 3. Ferramentas que voce vai precisar

### `Docker`

O `kind` depende de um runtime de containers. Como ja estamos usando Docker, vamos reutilizar essa base.

### `kubectl`

E a ferramenta oficial para conversar com o cluster Kubernetes.

### `kind`

E a ferramenta que cria o cluster Kubernetes local usando Docker.

### `Kustomize`

Ja vem integrado ao `kubectl` e sera usado para organizar manifests por ambiente.

## 4. Referencias oficiais

- Kubernetes `kubectl`: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
- kind quick start: https://kind.sigs.k8s.io/docs/user/quick-start/
- kind local registry: https://kind.sigs.k8s.io/docs/user/local-registry/
- Kustomize com `kubectl -k`: https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/
- Pod Security Admission: https://kubernetes.io/docs/concepts/security/pod-security-admission/

## 5. Passo a passo de preparacao

### Passo 1. Validar o Docker

Confirme que o Docker esta rodando:

```bash
docker --version
docker info
```

Se o `docker info` falhar, resolva isso antes de continuar.

### Passo 2. Instalar o `kubectl`

Use a documentacao oficial do Kubernetes para a sua distribuicao Linux.

Depois valide:

```bash
kubectl version --client
```

### Passo 3. Instalar o `kind`

Use a documentacao oficial do `kind`.

Depois valide:

```bash
kind version
```

### Passo 4. Confirmar que o `kubectl` suporta `-k`

```bash
kubectl kustomize --help
```

Se esse comando responder, voce ja tem o necessario para usar `Kustomize` integrado.

## 6. Estrutura que o repositorio passara a usar

O repositorio agora ja reserva a estrutura:

- [infra/k8s/README.md](/home/alexandre/workspace/web-socket/infra/k8s/README.md)
- [infra/k8s/kind/cluster.example.yaml](/home/alexandre/workspace/web-socket/infra/k8s/kind/cluster.example.yaml)
- [infra/k8s/base/README.md](/home/alexandre/workspace/web-socket/infra/k8s/base/README.md)
- [infra/k8s/overlays/local-kind/README.md](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/README.md)
- [infra/k8s/overlays/aws/README.md](/home/alexandre/workspace/web-socket/infra/k8s/overlays/aws/README.md)

## 7. Fluxo local recomendado

### Subir o ambiente de desenvolvimento com Compose

Esse passo continua util para desenvolvimento rapido:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Criar o cluster local

Quando os manifests Kubernetes existirem, o fluxo sera algo assim:

```bash
kind create cluster --config infra/k8s/kind/cluster.example.yaml
kubectl cluster-info
kubectl get nodes
```

### Criar o namespace do projeto

Depois:

```bash
kubectl create namespace web-socket
```

### Aplicar manifests com Kustomize

Quando a base estiver pronta:

```bash
kubectl apply -k infra/k8s/overlays/local-kind
```

## 8. Politica minima de seguranca

Para iniciantes, a regra segura e:

- um namespace so do projeto
- `Pod Security Admission` pelo menos em `baseline`
- sem `privileged: true`
- sem `hostNetwork`
- sem `hostPID`
- sem `hostPath`

## 9. Como acessar os servicos localmente

No laboratorio local, o ideal e preferir:

```bash
kubectl port-forward svc/api 3000:3000 -n web-socket
kubectl port-forward svc/image-processor-function 7071:7071 -n web-socket
```

Isso e melhor para estudo do que expor tudo cedo demais.

## 10. Como estudar sem se perder

Ordem sugerida:

1. entender `Pod`
2. entender `Deployment`
3. entender `Service`
4. entender `ConfigMap`
5. entender `Secret`
6. entender `PVC`
7. entender probes
8. so depois pensar em `Ingress`

## 11. Resultado esperado

Ao final desse laboratorio, voce vai conseguir:

- criar um cluster local
- aplicar manifests
- observar pods e services
- depurar rede e healthchecks
- transferir esse entendimento para EKS depois
