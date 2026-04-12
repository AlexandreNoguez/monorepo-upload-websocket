# Preparacao Do Ambiente De Desenvolvimento

Este guia foi escrito para iniciantes e foca no preparo do ambiente local para trabalhar neste repositorio.

Ele foi pensado especialmente para:

- Ubuntu 24.04
- WSL2 com shell `bash`

Mas quase tudo tambem vale para Linux em geral.

## 1. Objetivo

Ao final deste guia, voce deve conseguir:

- usar `git`
- usar `Docker` e `docker compose`
- usar `Node.js`
- usar `pnpm`
- usar `kubectl`
- usar `kind`
- subir o ambiente local com `docker compose`
- validar os prerequisitos do laboratorio Kubernetes

## 2. Visao geral das ferramentas

Antes dos comandos, vale entender rapidamente o papel de cada ferramenta.

### `git`

Responsavel por versionamento do codigo.

Sem ele, voce nao consegue:

- clonar o projeto
- salvar historico
- criar commits

### `Docker`

Responsavel por empacotar e executar servicos em containers.

Aqui ele sera usado para:

- `postgres`
- `azurite`
- `api`
- `image-processor-function`

### `docker compose`

Responsavel por subir multiplos containers juntos.

No projeto, ele e usado somente para desenvolvimento local.

### `Node.js`

Runtime do ecossistema JavaScript/TypeScript.

Aqui ele sera importante para:

- NestJS
- scripts de desenvolvimento
- uso do `corepack`

### `pnpm`

Gerenciador de pacotes escolhido para o monorepo.

Aqui ele sera usado para:

- instalar dependencias
- trabalhar com workspaces

### `kubectl`

CLI oficial do Kubernetes.

Ele sera usado para:

- conversar com o cluster
- aplicar manifests
- inspecionar recursos

### `kind`

Ferramenta para criar um cluster Kubernetes local usando Docker.

Ela sera usada para:

- estudar Kubernetes localmente
- testar manifests antes da cloud

## 3. Ordem recomendada de instalacao

Se voce esta preparando a maquina do zero, siga esta ordem:

1. pacotes basicos do sistema
2. `git`
3. `Docker`
4. `Node.js`
5. `pnpm`
6. `kubectl`
7. `kind`
8. clonar o repositorio
9. subir o ambiente local
10. validar o laboratorio Kubernetes

## 4. Pacotes basicos do Ubuntu

Esses pacotes ajudam em praticamente todo o resto:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release unzip
```

### Por que isso e necessario

- `ca-certificates`: permite conexoes HTTPS confiaveis
- `curl`: baixa arquivos e endpoints
- `gnupg`: ajuda a registrar chaves de repositorios
- `lsb-release`: ajuda a identificar a distribuicao
- `unzip`: util para alguns pacotes e ferramentas

## 5. Instalar o Git

Se o Git ainda nao estiver instalado:

```bash
sudo apt update
sudo apt install -y git
git --version
```

### Configuracao inicial recomendada

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
git config --global init.defaultBranch main
```

### Por que isso importa

Sem essa configuracao, seus commits podem ficar sem identidade clara.

## 6. Instalar o Docker no Ubuntu

Referencia oficial:

- https://docs.docker.com/engine/install/ubuntu/

### Passo 1. Remover pacotes conflitantes

```bash
sudo apt remove -y docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc
```

Se alguns nao estiverem instalados, tudo bem.

### Passo 2. Adicionar a chave e o repositorio oficial do Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

### Passo 3. Instalar Docker Engine e Compose plugin

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Passo 4. Validar

```bash
docker --version
docker compose version
sudo docker run hello-world
```

### Passo 5. Permitir uso sem `sudo`

```bash
sudo usermod -aG docker "$USER"
newgrp docker
```

Depois valide:

```bash
docker info
```

### Explicacao importante para iniciantes

Sem entrar no grupo `docker`, voce provavelmente vai precisar usar `sudo` em todos os comandos.

## 7. Instalar o Node.js

Referencia oficial:

- https://nodejs.org/en/download/package-manager

### Situacao atual deste repositorio

Nesta maquina, o `Node.js` ja esta instalado e funcionando.

Voce pode validar assim:

```bash
node --version
```

### Recomendacao pratica para este projeto

Use uma versao moderna de Node que suporte `corepack`. Se o `node --version` responder normalmente, o proximo passo e habilitar o `corepack`.

## 8. Habilitar e preparar o `pnpm`

Referencias oficiais:

- Node.js `Corepack`: https://nodejs.org/download/release/v20.11.1/docs/api/corepack.html
- pnpm installation: https://pnpm.io/installation

### Passo 1. Habilitar o Corepack

```bash
corepack enable
```

### Passo 2. Instalar a versao global desejada do pnpm

```bash
corepack install --global pnpm@10.8.1
```

### Passo 3. Validar

```bash
pnpm --version
```

### Explicacao importante

O projeto ja declara o gerenciador de pacotes em `package.json`, entao usar `Corepack` ajuda a manter a equipe sincronizada.

## 9. Instalar o `kubectl`

Referencia oficial:

- https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

### Metodo por binario

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

### Validar

```bash
kubectl version --client
kubectl kustomize --help
```

### O que significa essa validacao

- `kubectl version --client`: confirma que a CLI esta instalada
- `kubectl kustomize --help`: confirma que voce ja consegue usar `Kustomize`

## 10. Instalar o `kind`

Referencia oficial:

- https://kind.sigs.k8s.io/docs/user/quick-start/

### Instalar por binario em Linux x86_64

```bash
[ "$(uname -m)" = "x86_64" ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.31.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### Se a maquina for ARM64

```bash
[ "$(uname -m)" = "aarch64" ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.31.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### Validar

```bash
kind version
```

## 11. Clonar o repositorio

Se voce ainda nao estiver com o projeto localmente:

```bash
git clone <URL_DO_REPOSITORIO>
cd web-socket
```

Se o repositorio ja estiver clonado, basta entrar nele:

```bash
cd /caminho/para/web-socket
```

## 12. Validar as ferramentas no projeto

O repositorio agora possui um script para isso:

```bash
sh infra/scripts/k8s-preflight.sh
```

### O que esse script faz

Ele checa:

- `docker`
- `kubectl`
- `kind`

E mostra as versoes quando possivel.

## 13. Subir o ambiente local com Docker Compose

Para desenvolvimento, o fluxo principal e:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### O que esse comando faz

- constroi as imagens locais
- sobe `postgres`
- sobe `azurite`
- sobe `api`
- sobe `image-processor-function`

### Como validar

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

## 14. Criar o cluster local com kind

Depois que o `kind` estiver instalado:

```bash
sh infra/scripts/kind-create-cluster.sh
```

### O que esse script faz

- usa [cluster.example.yaml](/home/alexandre/workspace/web-socket/infra/k8s/kind/cluster.example.yaml)
- cria o cluster `web-socket-lab`
- mostra `kubectl cluster-info`
- mostra os nodes

## 15. Aplicar o namespace e a base local do Kubernetes

```bash
sh infra/scripts/k8s-apply-local-kind.sh
```

### O que isso aplica

Neste momento, a base local aplica:

- o namespace `web-socket`
- labels de seguranca com `Pod Security Admission` em `baseline`

## 16. Como validar o laboratorio Kubernetes

### Ver os nodes

```bash
kubectl get nodes
```

### Ver o namespace do projeto

```bash
kubectl get namespace web-socket
```

### Renderizar manifests do overlay local

```bash
kubectl kustomize infra/k8s/overlays/local-kind
```

## 17. Como desligar tudo

### Derrubar o ambiente Docker Compose

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Apagar o cluster kind

```bash
sh infra/scripts/kind-delete-cluster.sh
```

## 18. Problemas comuns

### `docker: permission denied`

Normalmente significa que seu usuario ainda nao esta no grupo `docker`, ou que a sessao ainda nao foi renovada depois do `usermod`.

### `kind: command not found`

Normalmente significa:

- `kind` nao foi instalado
- ou foi instalado fora do `PATH`

### `pnpm` nao funciona logo de primeira

Geralmente isso significa que o `Corepack` ainda nao foi habilitado ou que a primeira execucao ainda nao baixou o binario do `pnpm`.

### `kubectl` instalado mas cluster nao responde

Isso costuma significar que:

- o cluster ainda nao foi criado
- ou o `kind` falhou ao criar o cluster

## 19. Sequencia minima para um iniciante

Se voce quiser a versao mais curta do processo:

```bash
sudo apt update
sudo apt install -y git ca-certificates curl gnupg lsb-release unzip
```

```bash
sudo apt remove -y docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

```bash
corepack enable
corepack install --global pnpm@10.8.1
```

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl.sha256"
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

```bash
[ "$(uname -m)" = "x86_64" ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.31.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

```bash
sh infra/scripts/k8s-preflight.sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
sh infra/scripts/kind-create-cluster.sh
sh infra/scripts/k8s-apply-local-kind.sh
```

## 20. Documentacao relacionada

- [Infraestrutura local da Fase 2](/home/alexandre/workspace/web-socket/docs/fase-2-infra-local.md)
- [Tutorial do laboratório local com kind](/home/alexandre/workspace/web-socket/docs/local-kind-tutorial.md)
- [Registro da Fase 14](/home/alexandre/workspace/web-socket/docs/fase-14-laboratorio-kind.md)
- [Plano de migração para Kubernetes](/home/alexandre/workspace/web-socket/docs/kubernetes-migration.md)
