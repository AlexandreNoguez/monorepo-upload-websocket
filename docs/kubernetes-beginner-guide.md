# Guia Iniciante De Kubernetes Para Este Projeto

Este guia existe para explicar Kubernetes com foco no nosso projeto, sem assumir experiencia previa.

Ele complementa os tutoriais operacionais e responde uma pergunta muito comum de quem esta estudando:

"Eu consigo rodar os comandos, mas o que exatamente cada coisa significa?"

## 1. A ideia geral

Quando usamos Kubernetes, estamos dizendo:

- eu quero descrever o estado desejado do sistema
- o cluster tenta manter esse estado automaticamente
- eu paro de controlar container por container manualmente

No nosso projeto, isso faz sentido porque temos varios blocos com papeis diferentes:

- `api`
- `image-processor-function`
- `postgres`
- `azurite`

Em `docker compose`, a orquestracao e boa para desenvolvimento rapido.

Em Kubernetes, a vantagem e estudar um modelo mais proximo do mundo real:

- rede interna entre servicos
- declaracao de disponibilidade
- health checks
- persistencia
- configuracao por ambiente

## 2. O que e um cluster

Um cluster Kubernetes e o conjunto que executa e gerencia os workloads.

No nosso laboratorio local, o cluster e criado com `kind`.

### Por que usamos `kind`

- e gratuito
- roda localmente
- usa Docker como base
- permite estudar Kubernetes de verdade

## 3. O que e um node

Um `node` e uma maquina que participa do cluster.

No `kind`, cada node e representado por um container Docker especial.

Voce pode ver os nodes com:

```bash
kubectl get nodes
```

### O que esse comando faz

- conversa com o cluster
- pede a lista de nodes
- mostra status, versao e papel de cada node

## 4. O que e um pod

`Pod` e a menor unidade executavel do Kubernetes.

Voce pode pensar assim:

- container e o processo empacotado
- pod e o envelope Kubernetes que hospeda um ou mais containers

Na pratica, quase sempre comecamos com um container por pod.

No nosso projeto:

- a `api` roda dentro de pods
- a `image-processor-function` roda dentro de pods
- o `azurite` roda dentro de um pod
- o `postgres` roda dentro de um pod gerenciado por `StatefulSet`

Voce pode listar pods com:

```bash
kubectl get pods -n web-socket
```

### Por que isso importa

Quando um pod falha, o Kubernetes pode recriar outro para manter o estado desejado.

Por isso, em Kubernetes, voce normalmente nao "cuida do container direto". Voce descreve o recurso que deveria manter aquele pod vivo.

## 5. O que e um `Deployment`

`Deployment` e o recurso usado para workloads stateless ou quase stateless.

No nosso projeto ele foi usado para:

- `api`
- `image-processor-function`
- `azurite`

### Por que usamos `Deployment` nesses casos

- queremos reinicio automatico
- queremos rollout simples
- queremos modelo padrao para aplicacoes HTTP

Voce pode listar Deployments com:

```bash
kubectl get deployments -n web-socket
```

## 6. O que e um `StatefulSet`

`StatefulSet` e o recurso usado quando o workload depende mais fortemente de identidade estavel e armazenamento persistente.

No nosso projeto ele foi usado para o `postgres`.

### Por que nao usar `Deployment` para o banco

Ate daria para montar um laboratorio com `Deployment` + `PVC`, mas `StatefulSet` ensina um modelo mais correto para banco:

- identidade mais previsivel do pod
- relacao mais clara com persistencia
- semantica melhor para recurso stateful

Voce pode listar `StatefulSet` com:

```bash
kubectl get statefulsets -n web-socket
```

## 7. O que e um `Service`

`Service` da um nome de rede estavel para um conjunto de pods.

Isso e necessario porque o IP do pod pode mudar quando ele e recriado.

No nosso projeto temos `Service` para:

- `api`
- `image-processor-function`
- `postgres`
- `azurite`

Voce pode listar com:

```bash
kubectl get services -n web-socket
```

### Exemplo mental simples

Em vez de a Function tentar encontrar "o IP atual da API", ela usa o nome `api`.

Em vez de a API tentar descobrir "qual e o pod atual do postgres", ela usa o nome `postgres`.

## 8. O que e um `ConfigMap`

`ConfigMap` guarda configuracoes nao sensiveis.

No nosso projeto, o objeto `app-config` e gerado a partir do arquivo [app-config.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-config.env.example).

Ele contem coisas como:

- portas
- host interno do banco
- nomes dos containers do storage
- URL WebSocket interna

### Por que isso e melhor do que colocar valor no YAML do pod

- deixa o workload mais limpo
- separa configuracao de execucao
- facilita trocar valores por ambiente

## 9. O que e um `Secret`

`Secret` guarda configuracoes sensiveis ou tratadas como sensiveis.

No nosso projeto, o objeto `app-secrets` e gerado a partir de [app-secrets.env.example](/home/alexandre/workspace/web-socket/infra/k8s/overlays/local-kind/app-secrets.env.example).

Ele contem:

- usuario e senha do banco
- `DATABASE_URL`
- segredo compartilhado entre API e Function
- connection string do Azurite

### Observacao importante

Neste laboratorio, os exemplos ficam versionados para estudo.

Em ambiente real, o ideal e usar um gerenciador de segredos da nuvem.

## 10. O que e um `PVC`

`PVC` significa `PersistentVolumeClaim`.

Ele representa um pedido de armazenamento persistente.

No nosso projeto:

- o `azurite` usa um `PVC`
- o `postgres` usa `volumeClaimTemplates` dentro do `StatefulSet`

### Por que isso e necessario

Sem persistencia:

- blobs do Azurite sumiriam
- dados do banco sumiriam
- o laboratorio ficaria fraco para estudo

Voce pode listar volumes pedidos com:

```bash
kubectl get pvc -n web-socket
```

## 11. Por que usar `envFrom`

Nos workloads da aplicacao e do banco, usamos `envFrom`.

Isso significa:

- importar todas as chaves do `ConfigMap`
- importar todas as chaves do `Secret`

### Por que isso foi escolhido

- reduz ruido nos manifests
- melhora a leitura para iniciantes
- reforca a ideia de que o ambiente concreto gera a configuracao concreta

Uma alternativa seria declarar variavel por variavel com `configMapKeyRef` e `secretKeyRef`.

Isso pode ser melhor quando voce quer muito controle fino, mas para o laboratorio ficou mais verboso do que educativo.

## 12. Por que o `base` nao carrega valores concretos

O `base` descreve a arquitetura comum:

- quais workloads existem
- que imagens sao usadas
- que portas cada pod expoe
- que tipo de recurso cada parte usa

Os valores de ambiente ficam no overlay `local-kind`.

### Por que arquitetar assim

Porque isso prepara o projeto para varios ambientes:

- `local-kind`
- `aws`
- qualquer outro overlay futuro

Se os valores concretos ficassem todos hardcoded no `base`, cada ambiente exigiria mais copia, mais duplicacao e mais risco de divergencia.

## 13. O fluxo operacional local

O fluxo completo agora pode ser feito por um unico script:

```bash
sh infra/scripts/k8s-bootstrap-local-kind.sh
```

### O que esse script faz

1. verifica prerequisitos
2. builda as imagens da `api` e da `image-processor-function`
3. cria o cluster se ele ainda nao existir
4. carrega as imagens no `kind`
5. prepara os arquivos `.env`
6. aplica o overlay local
7. mostra o estado dos recursos

### Por que isso ajuda

- reduz a quantidade de comandos para comecar
- evita esquecer uma etapa importante
- ajuda quem esta estudando a seguir uma ordem segura

## 14. Comandos de observacao que vale decorar

Ver pods:

```bash
kubectl get pods -n web-socket
```

Ver detalhes de um pod:

```bash
kubectl describe pod <nome-do-pod> -n web-socket
```

Ver logs:

```bash
kubectl logs <nome-do-pod> -n web-socket
```

Ver configuracao aplicada:

```bash
kubectl get configmap app-config -n web-socket -o yaml
kubectl get secret app-secrets -n web-socket -o yaml
```

Renderizar sem aplicar:

```bash
kubectl kustomize infra/k8s/overlays/local-kind
```

Fazer acesso local temporario:

```bash
kubectl port-forward svc/api 3000:3000 -n web-socket
kubectl port-forward svc/image-processor-function 7071:7071 -n web-socket
kubectl port-forward pod/postgres-0 5432:5432 -n web-socket
```

## 15. Resultado mental que voce deve guardar

Se eu resumisse o desenho do projeto em uma frase, seria:

"Kubernetes descreve e mantem a topologia do sistema; overlays definem o ambiente concreto; pods executam os processos; Services estabilizam a rede; volumes preservam os dados."

Se essa frase fizer sentido para voce, ja estamos construindo uma base muito boa.
