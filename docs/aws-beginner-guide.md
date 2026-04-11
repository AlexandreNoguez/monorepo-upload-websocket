# Guia Iniciante De AWS Para Este Projeto

Este guia foi escrito para iniciantes e foca no caminho mais coerente para este repositorio.

## 1. Aviso importante sobre custos

As ferramentas locais desta trilha podem ser gratuitas, mas a AWS nao e automaticamente gratuita.

Em especial:

- `Amazon EKS` tem cobranca do cluster e tambem dos recursos que executam seus workloads
- `Amazon RDS` cobra pelo banco e armazenamento
- `Amazon S3` cobra por armazenamento e requisicoes
- `Amazon ECR` cobra pelo armazenamento das imagens

Referencias oficiais:

- Amazon EKS pricing: https://aws.amazon.com/eks/pricing/
- Amazon RDS for PostgreSQL pricing: https://aws.amazon.com/rds/postgresql/pricing/
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Amazon ECR pricing: https://aws.amazon.com/ecr/pricing/

Se o objetivo imediato e estudar sem custo, use primeiro:

- `Docker`
- `kind`
- `kubectl`

So depois suba para a AWS.

## 2. Arquitetura recomendada na AWS

Para este projeto, a recomendacao principal e:

- `Amazon EKS` para `api` e `image-processor-function`
- `Amazon ECR` para as imagens
- `Amazon RDS for PostgreSQL` para o banco
- `Amazon S3` para os arquivos

### Mapeamento do laboratorio local para a AWS

- `docker image local` -> `Amazon ECR`
- `kind` -> `Amazon EKS`
- `postgres` local -> `Amazon RDS for PostgreSQL`
- `Azurite` -> `Amazon S3`

## 3. Referencias oficiais

- AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
- Amazon EKS getting started: https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html
- Amazon EKS with `eksctl`: https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html
- Create an Amazon EKS cluster: https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html
- Amazon ECR image push: https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-push.html
- Amazon RDS getting started: https://docs.aws.amazon.com/AmazonRDS/latest/gettingstartedguide/what-is-rds.html
- Create PostgreSQL DB in RDS: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html
- Amazon S3 getting started: https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html

## 4. Ordem recomendada para iniciantes

### Etapa 1. Criar e proteger a conta AWS

Antes de qualquer recurso:

- crie a conta
- proteja o usuario root
- crie um usuario administrativo separado

A documentacao oficial de RDS reforca essa base ao orientar a configuracao inicial da conta AWS antes de criar bancos.

### Etapa 2. Instalar as ferramentas locais da AWS

Voce vai precisar de:

- `AWS CLI v2`
- `kubectl`
- `eksctl`
- `Docker`

Depois de instalar, valide:

```bash
aws --version
kubectl version --client
eksctl version
docker --version
```

### Etapa 3. Configurar credenciais

Configure a AWS CLI:

```bash
aws configure
```

Voce vai informar:

- Access Key ID
- Secret Access Key
- regiao padrao
- formato de saida

Para iniciantes, escolha uma unica regiao e mantenha tudo nela no inicio.

### Etapa 4. Criar repositorios no Amazon ECR

Voce vai precisar de um repositorio para cada imagem principal:

- `web-socket-api`
- `web-socket-image-processor-function`

Fluxo conceitual:

1. criar o repositorio
2. autenticar o Docker no ECR
3. buildar a imagem
4. taggear a imagem
5. enviar a imagem

### Etapa 5. Criar o cluster no Amazon EKS

Para iniciantes, a forma mais simples e usar `eksctl`.

A documentacao oficial do EKS indica o fluxo com `eksctl` como a forma mais rapida de comecar.

Conceitualmente, o comando sera parecido com:

```bash
eksctl create cluster --name web-socket-cluster --region sua-regiao
```

Depois valide:

```bash
kubectl get nodes
```

### Etapa 6. Criar o banco no Amazon RDS for PostgreSQL

Para iniciantes, use o fluxo guiado do console e a opcao mais simples de criacao.

O caminho oficial do RDS para PostgreSQL guia voce por:

- criar a instancia
- escolher engine PostgreSQL
- escolher identificador
- definir usuario mestre
- conectar depois com cliente SQL

### Etapa 7. Criar o bucket no Amazon S3

No S3, voce vai criar pelo menos:

- um bucket para arquivos originais
- um bucket ou prefixo para arquivos processados

Comece simples:

- um bucket
- dois prefixos logicos

Por exemplo:

- `original/`
- `processed/`

### Etapa 8. Aplicar os manifests no EKS

Depois de:

- subir imagens no ECR
- ter o cluster no EKS
- ter o banco no RDS
- ter o bucket no S3

Voce adapta os overlays Kubernetes para AWS e aplica:

```bash
kubectl apply -k infra/k8s/overlays/aws
```

## 5. Tutorial conceitual de deploy para iniciantes

### Passo 1. Buildar a imagem da API

Conceitualmente:

```bash
docker build -f infra/docker/api/Dockerfile --target production -t web-socket-api:prod .
```

### Passo 2. Buildar a imagem do processador

```bash
docker build -f infra/docker/function/Dockerfile --target production -t web-socket-image-processor-function:prod .
```

### Passo 3. Enviar imagens ao ECR

Siga o fluxo do ECR:

- login no registry
- tag da imagem com URI do ECR
- `docker push`

### Passo 4. Configurar variaveis de ambiente da AWS

No overlay AWS, voce vai trocar:

- `DATABASE_URL` para apontar para o RDS
- endpoint local de blob para o bucket S3
- URLs internas e externas do sistema

### Passo 5. Aplicar o deployment

```bash
kubectl apply -k infra/k8s/overlays/aws
kubectl get pods -n web-socket
kubectl get svc -n web-socket
```

## 6. Como pensar a migracao para AWS sem confundir os papeis

### O que continua igual

- o dominio
- os casos de uso
- a regra de negocio
- os contratos da API

### O que muda

- object storage local vira `S3`
- banco local vira `RDS`
- cluster local vira `EKS`
- imagens locais viram imagens no `ECR`

## 7. Duas estrategias possiveis para o processador

### Estrategia recomendada para este repositorio

Manter o processador como workload em Kubernetes.

Por que isso e melhor aqui:

- reforca o estudo de Kubernetes
- reaproveita o mesmo modelo operacional da API
- reduz troca de paradigma no inicio

### Estrategia alternativa para comparar no futuro

Trocar o processador para fluxo serverless na AWS.

Nesse caso, o equivalente conceitual seria:

- `Amazon S3` para upload
- evento do S3
- funcao serverless para processamento

Mas essa nao e a trilha principal deste repositorio agora.

## 8. Rota de aprendizado recomendada

1. estudar localmente com `kind`
2. entender manifests e overlays
3. entender imagens e registry
4. aprender o deploy no `EKS`
5. so depois sofisticar com ingress, TLS e observabilidade

## 9. Erros comuns de iniciantes

- tentar aprender Kubernetes e AWS ao mesmo tempo sem laboratorio local
- usar `localhost` em configuracoes que rodam dentro do cluster
- subir recursos AWS sem entender custos
- esquecer de limpar recursos ao terminar os testes
- confundir `Service` do Kubernetes com `Load Balancer` da cloud

## 10. Regra pratica para este projeto

Se estiver estudando:

- primeiro `kind`
- depois `EKS`

Se estiver validando custo:

- primeiro `kind`
- depois uma prova pequena na AWS

Essa ordem economiza dinheiro e reduz frustracao.
