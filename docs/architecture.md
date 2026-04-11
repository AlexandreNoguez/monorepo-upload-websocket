# Arquitetura Do Projeto

## 1. Visão geral

A proposta é construir um sistema de processamento de imagens orientado a domínio, dividido em responsabilidades claras:

- o `NestJS` coordena o negócio
- a `Azure Function` executa o processamento da imagem
- o `Blob Storage` guarda os arquivos
- o `PostgreSQL` guarda o estado do negócio e o histórico
- o `WebSocket` leva eventos de progresso e resultado em tempo real

Essa separação existe porque o sistema possui dois tipos de trabalho muito diferentes:

1. trabalho de negócio
2. trabalho pesado/técnico de processamento

O trabalho de negócio é:

- registrar upload
- validar regras
- persistir estado
- responder consultas
- expor API para clientes
- organizar os casos de uso

O trabalho técnico é:

- ler blob
- manipular imagem
- gerar arquivo derivado
- publicar progresso

Separar essas duas coisas deixa o sistema mais simples de evoluir.

## 2. Problema que estamos resolvendo

Queremos que um usuário envie uma imagem e que o sistema acompanhe todo o ciclo de vida dela:

1. imagem recebida
2. upload concluído
3. processamento iniciado
4. progresso do processamento
5. processamento concluído ou falho
6. artefatos gerados e persistidos

Sem esse desenho, é comum cair em um backend “inchado”, onde:

- controller fala com banco direto
- regra de negócio fica espalhada
- processamento fica acoplado ao upload
- status ficam inconsistentes
- fica difícil saber quem é responsável por cada decisão

DDD + Clean Architecture ajudam justamente a evitar isso.

## 3. Por que usar DDD aqui

`DDD` é útil quando o problema tem estados, regras e linguagem de negócio que precisam ser bem modelados.

Mesmo em um projeto de estudo, já temos um domínio real:

- uma imagem existe no sistema
- uma imagem pode ter versões
- um processamento possui status
- um processamento pode falhar
- cada alteração precisa ser registrada
- o backend precisa distinguir “arquivo enviado” de “arquivo processado”

Se modelarmos isso só como tabelas e endpoints, funciona no começo, mas rapidamente vira uma coleção de ifs.

Com DDD, damos nome às coisas certas:

- `ImageAsset`
- `ProcessingJob`
- `ProcessedVariant`
- `ProcessingStatus`
- `BlobObjectKey`
- `FunctionExecutionId`

Quando os nomes ficam corretos, o sistema também fica mais fácil de entender.

## 4. Por que usar Clean Architecture

`Clean Architecture` serve para proteger a regra de negócio das tecnologias.

Isso é importante porque:

- hoje você usa Azure Functions
- amanhã pode trocar por fila + worker
- hoje você usa Prisma
- amanhã pode trocar por outro ORM
- hoje você usa WebSocket
- amanhã pode complementar com filas/event bus

Se a regra de negócio depender direto de NestJS, Prisma e Azure SDK, cada troca machuca muito.

Com Clean Architecture, a dependência aponta para dentro:

- regras de negócio no centro
- casos de uso ao redor
- adaptadores e infraestrutura do lado de fora

## 5. Estrutura sugerida do monorepo

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── modules
│   │   │   ├── domain
│   │   │   ├── application
│   │   │   ├── infrastructure
│   │   │   └── interfaces
│   │   ├── prisma
│   │   └── test
│   └── image-processor-function
│       ├── functions
│       ├── shared
│       ├── tests
│       └── host.json
├── packages
│   └── shared
│       ├── schemas
│       ├── contracts
│       └── docs
├── infra
│   ├── docker
│   ├── compose
│   └── scripts
└── docs
```

## 6. Responsabilidades de cada parte

### 6.1 `apps/api`

É o coração do sistema.

Responsável por:

- receber comandos do cliente
- expor API HTTP
- expor gateway WebSocket
- persistir dados com Prisma
- aplicar casos de uso
- publicar status para clientes

### 6.2 `apps/image-processor-function`

É o executor técnico do processamento.

Responsável por:

- reagir à criação do blob
- baixar a imagem
- processar a imagem
- salvar versões derivadas
- enviar eventos via WebSocket

### 6.3 `packages/shared`

Aqui ficam artefatos compartilhados conceitualmente.

Como a API está em `TypeScript` e a Function em `Python`, não faz sentido assumir compartilhamento de código executável entre os dois. O compartilhamento deve ser de contrato.

Exemplos:

- `JSON Schema` das mensagens de WebSocket
- convenções de nomes de eventos
- exemplos de payload
- documentação do protocolo

Isso é importante porque evita “cada lado inventa um formato”.

## 7. Fluxo funcional proposto

## 7.1 Fluxo principal

1. O cliente solicita upload de imagem.
2. O backend cria um `ImageAsset` e um `ProcessingJob` com status inicial.
3. O backend devolve instruções de upload para o blob.
4. O cliente envia o arquivo.
5. O Blob Storage registra o novo objeto.
6. A Azure Function é disparada por `Blob Trigger`.
7. A Function abre uma conexão WebSocket com o backend.
8. A Function envia `processing.started`.
9. A Function processa a imagem e envia `processing.progress`.
10. A Function salva os artefatos processados.
11. A Function envia `processing.completed` ou `processing.failed`.
12. O backend persiste o estado final e pode retransmitir o status para o frontend.

## 7.2 Fluxo alternativo de falha

1. O blob é criado.
2. A Function inicia.
3. O arquivo está corrompido ou inválido.
4. A Function envia `processing.failed`.
5. O backend marca o `ProcessingJob` como falho.
6. O sistema mantém o histórico da falha para auditoria e reprocessamento.

## 8. Casos de uso detalhados

Aqui está a parte mais importante para estudo. Cada caso de uso existe porque representa uma intenção do negócio, não um detalhe técnico.

## 8.1 Caso de uso: Solicitar upload de imagem

### Objetivo

Registrar que uma nova imagem será enviada para o sistema.

### Entrada

- nome original do arquivo
- content type
- tamanho estimado
- identificador do usuário

### Saída

- `imageAssetId`
- `processingJobId`
- local/chave esperada do blob
- status inicial

### Regras

- aceitar apenas tipos permitidos
- limitar tamanho
- gerar uma chave única para o blob
- criar estado inicial consistente

### Por que esse caso de uso é importante

Muita gente tenta começar só fazendo upload direto no storage. O problema é que o domínio perde controle do ciclo de vida. Ao registrar a intenção antes do upload:

- já existe identidade para a imagem
- já existe rastreabilidade
- o backend sabe o que deveria chegar
- fica mais fácil correlacionar o blob com o banco

## 8.2 Caso de uso: Confirmar upload recebido

### Objetivo

Marcar que o arquivo realmente existe no storage.

### Entrada

- `imageAssetId`
- chave do blob
- tamanho real
- timestamp

### Saída

- imagem marcada como carregada
- job pronto para processamento

### Por que ele existe

Upload solicitado não significa upload concluído. Essa separação é importante porque:

- o usuário pode desistir
- a rede pode falhar
- o arquivo pode nunca chegar

Separar os estados evita mentir para o domínio.

## 8.3 Caso de uso: Iniciar processamento da imagem

### Objetivo

Trocar o job para estado de execução.

### Entrada

- `processingJobId`
- `functionExecutionId`
- timestamp

### Saída

- status `PROCESSING`
- histórico do evento

### Por que ele existe

Começar o processamento não é só “mudar uma coluna”. É um marco de negócio:

- agora existe uma execução em andamento
- o sistema pode mostrar progresso
- o sistema passa a aceitar eventos de progresso desse job

## 8.4 Caso de uso: Registrar progresso do processamento

### Objetivo

Persistir marcos intermediários informados pela Function.

### Entrada

- `processingJobId`
- etapa atual
- percentual
- mensagem técnica opcional

### Saída

- histórico salvo
- estado visível para clientes

### Por que ele existe

Aqui está uma das maiores motivações para o uso de WebSocket. Em HTTP, você normalmente faria:

- polling
- muitas requisições pequenas
- atualização com atraso

Com WebSocket:

- a Function envia quando tiver novidade
- o backend recebe quase em tempo real
- o cliente também pode receber esse evento rapidamente

Esse caso de uso é útil porque separa “progresso observável” de “resultado final”.

## 8.5 Caso de uso: Concluir processamento com sucesso

### Objetivo

Persistir o resultado final do processamento.

### Entrada

- `processingJobId`
- metadados extraídos
- caminhos dos arquivos gerados
- dimensões
- checksums

### Saída

- job marcado como concluído
- variantes processadas persistidas
- imagem pronta para consumo

### Por que ele existe

Se o projeto misturar isso com o progresso, você perde clareza. Conclusão é um evento especial porque:

- encerra a execução
- libera consumo do resultado
- registra saída definitiva

## 8.6 Caso de uso: Registrar falha de processamento

### Objetivo

Persistir erro de forma controlada.

### Entrada

- `processingJobId`
- código do erro
- mensagem
- etapa onde falhou

### Saída

- job marcado como falho
- histórico salvo
- possibilidade de retry futuro

### Por que ele existe

Erro também faz parte do domínio. Não é só log técnico. O sistema precisa saber:

- que falhou
- onde falhou
- se pode tentar de novo
- o que mostrar para o usuário

## 8.7 Caso de uso: Consultar status da imagem

### Objetivo

Permitir que cliente ou painel administrativo vejam o estado atual.

### Entrada

- `imageAssetId`

### Saída

- dados da imagem
- status do job
- histórico resumido
- artefatos gerados

### Por que ele existe

Todo fluxo assíncrono precisa de um ponto de leitura confiável. O WebSocket é ótimo para atualização em tempo real, mas a consulta persistida continua necessária para:

- recarregar tela
- auditoria
- suporte
- consistência

## 9. Modelo de domínio sugerido

## 9.1 Agregados principais

### `ImageAsset`

Representa a imagem original dentro do sistema.

Possíveis atributos:

- `id`
- `ownerId`
- `originalFilename`
- `contentType`
- `blobKey`
- `uploadStatus`
- `createdAt`

### `ProcessingJob`

Representa o ciclo de processamento dessa imagem.

Possíveis atributos:

- `id`
- `imageAssetId`
- `status`
- `startedAt`
- `finishedAt`
- `failureReason`
- `functionExecutionId`

### `ProcessedVariant`

Representa um artefato gerado a partir da imagem original.

Possíveis atributos:

- `id`
- `imageAssetId`
- `processingJobId`
- `variantType`
- `blobKey`
- `width`
- `height`
- `checksum`

## 9.2 Value Objects

### `BlobObjectKey`

Evita tratar a chave do blob como string solta em toda parte.

### `ProcessingStatus`

Representa estados válidos:

- `PENDING_UPLOAD`
- `UPLOADED`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

### `ImageMetadata`

Agrupa informações como:

- largura
- altura
- tamanho
- formato

## 10. Camadas na API NestJS

Uma forma simples de organizar dentro de `apps/api`:

## 10.1 `domain`

Contém:

- entidades
- value objects
- regras invariantes
- interfaces de repositório
- eventos de domínio

Essa camada não deve conhecer NestJS, Prisma ou WebSocket.

## 10.2 `application`

Contém:

- casos de uso
- DTOs internos
- portas de entrada e saída
- orquestração do domínio

Aqui mora o “o que o sistema faz”.

## 10.3 `infrastructure`

Contém:

- implementação Prisma dos repositórios
- cliente do blob
- validação de ambiente
- adaptadores externos

Aqui mora o “como a tecnologia faz”.

## 10.4 `interfaces`

Contém:

- controllers HTTP
- gateways WebSocket
- presenters
- mappers de request/response

Aqui entra e sai dado do mundo externo.

## 11. Onde o WebSocket entra na arquitetura

O ponto mais saudável para estudo é:

- o `NestJS` expõe um gateway WebSocket
- a `Azure Function` atua como cliente WebSocket durante o processamento

Isso resolve um problema real: a Function precisa enviar múltiplos eventos ao backend sem abrir várias requisições HTTP independentes.

## 11.1 Motivações para usar WebSocket no lugar de HTTP

### Comunicação contínua

HTTP é ótimo para request/response. Aqui o processamento pode emitir vários eventos:

- iniciou
- 20%
- 50%
- miniatura salva
- escala de cinza salva
- concluído

Com HTTP, isso costuma virar várias chamadas separadas. Com WebSocket, a conexão fica aberta durante o processamento.

### Menor sobrecarga conceitual para progresso

Com HTTP, para acompanhar progresso normalmente você escolhe entre:

- polling do cliente para o backend
- múltiplos POSTs da Function

Com WebSocket, o modelo mental é mais direto:

- aconteceu algo
- envia um evento

### Melhor experiência para telas em tempo real

Se depois você criar frontend, o NestJS já poderá:

- receber evento da Function
- persistir no banco
- retransmitir para clientes conectados

Isso cria um canal natural de tempo real.

## 11.2 Quando HTTP seria melhor

É importante estudar também a honestidade arquitetural: nem sempre WebSocket é a melhor opção.

HTTP seria melhor se:

- só existisse um único retorno final
- não houvesse necessidade de progresso
- a Function só precisasse notificar uma vez
- você quisesse simplicidade máxima

Então a motivação para WebSocket aqui não é “moda”. É o fato de termos um fluxo assíncrono com múltiplos eventos intermediários.

## 11.3 Cuidados importantes com Azure Functions

Aqui existe uma observação importante: Azure Functions não são o melhor lugar do mundo para conexões longas e permanentes.

Por isso, a recomendação para este projeto é:

- usar WebSocket apenas durante a janela de execução da Function
- não depender de conexão permanente entre backend e Function
- manter persistência no banco como fonte de verdade

Em outras palavras:

- o WebSocket entrega rapidez
- o banco entrega consistência

Essa dupla é importante.

## 12. Contrato de mensagens WebSocket

Sugestão de eventos:

- `processing.started`
- `processing.progress`
- `processing.completed`
- `processing.failed`

Payload base sugerido:

```json
{
  "event": "processing.progress",
  "jobId": "uuid",
  "imageAssetId": "uuid",
  "functionExecutionId": "uuid-or-run-id",
  "occurredAt": "2026-04-07T12:00:00Z",
  "payload": {
    "step": "generate-thumbnail",
    "progress": 60,
    "message": "thumbnail created"
  }
}
```

Campos importantes:

- `event`: qual fato ocorreu
- `jobId`: qual processamento foi afetado
- `imageAssetId`: correlação com a imagem
- `functionExecutionId`: correlação com a execução da Function
- `occurredAt`: ordenação temporal
- `payload`: dados específicos do evento

## 13. Persistência sugerida no PostgreSQL

Tabelas iniciais sugeridas:

- `image_assets`
- `processing_jobs`
- `processed_variants`
- `processing_events`

### `image_assets`

Guarda a identidade da imagem original.

### `processing_jobs`

Guarda o status atual e dados de execução.

### `processed_variants`

Guarda os arquivos derivados.

### `processing_events`

Guarda histórico detalhado do fluxo.

Essa tabela de eventos é muito valiosa em estudo e produção porque ajuda a responder:

- o que aconteceu
- quando aconteceu
- em que ordem aconteceu

## 14. Prisma no projeto

O Prisma entra como detalhe de infraestrutura.

Isso quer dizer:

- os casos de uso não devem depender diretamente do Prisma Client
- a aplicação fala com interfaces de repositório
- a infraestrutura implementa essas interfaces usando Prisma

Por que isso é importante?

Porque o ORM não deve ditar as regras do domínio.

Se o domínio depender diretamente do Prisma:

- testes ficam mais difíceis
- troca de persistência fica mais cara
- a regra de negócio fica misturada com consulta SQL/ORM

## 15. Containers Docker

Para desenvolvimento local, a stack pode ser:

- `api`
- `function`
- `postgres`
- `azurite`

### `api`

Container do NestJS.

### `function`

Container da Azure Function em Python.

### `postgres`

Banco relacional.

### `azurite`

Emulador local do Azure Storage.

Por que usar containers aqui?

- padroniza ambiente
- evita “na minha máquina funciona”
- facilita subir tudo junto
- aproxima do cenário real

## 16. Sequência de implementação recomendada

### Etapa 1

Subir monorepo, Docker, PostgreSQL e Azurite.

### Etapa 2

Criar API NestJS com arquitetura base e Prisma.

### Etapa 3

Modelar domínio de imagem e processamento.

### Etapa 4

Criar fluxo de solicitação de upload e persistência inicial.

### Etapa 5

Criar Azure Function com Blob Trigger.

### Etapa 6

Criar comunicação WebSocket da Function para a API.

### Etapa 7

Persistir progresso, sucesso e falha.

### Etapa 8

Adicionar testes de integração e documentação operacional.

## 17. Decisão de processamento da imagem

Para começar simples, a Function vai executar três responsabilidades:

1. extrair metadados da imagem
2. gerar uma miniatura
3. gerar uma versão em escala de cinza

### Por que essa escolha é boa

- produz múltiplos eventos
- gera artefatos derivados
- cria um fluxo fácil de observar
- não exige IA nem processamento excessivamente complexo

Depois, o projeto pode evoluir para:

- remoção de fundo
- detecção de objetos
- OCR
- classificação por modelo

## 18. Resumo arquitetural

Se eu resumisse toda a motivação do projeto em poucas linhas, seria:

- `DDD` organiza o significado do negócio
- `Clean Architecture` protege esse significado das tecnologias
- `WebSocket` faz sentido porque queremos progresso em tempo real
- `Azure Function` isola o processamento técnico da imagem
- `Prisma + PostgreSQL` persistem o estado confiável
- `Azurite + Docker` tornam o ambiente local reproduzível

Essa combinação é muito boa para estudo porque mostra, no mesmo projeto:

- arquitetura
- modelagem de domínio
- integração entre serviços
- processamento assíncrono
- persistência
- eventos em tempo real

## 19. Evolução de infraestrutura

O projeto passa a ter agora uma direção de infraestrutura mais clara:

- `docker compose` fica restrito ao desenvolvimento local
- `Kubernetes` vira o modelo principal de orquestração
- `kind` será o laboratório local para estudar Kubernetes sem depender de cloud
- `AWS` será a referência de arquitetura em nuvem

### 19.1 Por que `docker compose` fica só no desenvolvimento

O `compose` é excelente para:

- subir dependências rapidamente
- iterar localmente
- depurar integrações

Mas ele não deve representar produção quando o alvo real é Kubernetes. Manter `compose` como se fosse “quase produção” costuma gerar uma falsa equivalência entre ambientes.

Por isso, a regra do projeto passa a ser:

- `compose` para produtividade local
- `k8s` para orquestração real

### 19.2 Topologia alvo local

Para estudo local, a evolução recomendada é:

1. `docker compose` para bootstrap inicial
2. `kind` para cluster Kubernetes local
3. `Kustomize` para aplicar os manifests

### 19.3 Topologia alvo em cloud

Pensando em AWS, a arquitetura-alvo mais coerente para este projeto é:

- `Amazon EKS` para orquestração
- `Amazon ECR` para imagens
- `Amazon RDS for PostgreSQL` para banco gerenciado
- `Amazon S3` para armazenamento de objetos

### 19.4 Equivalências conceituais importantes

No laboratório local:

- `Azurite` representa o papel de object storage
- `postgres` em container representa o papel de banco relacional

Na AWS:

- `Amazon S3` assume o papel do object storage
- `Amazon RDS for PostgreSQL` assume o papel do banco gerenciado

### 19.5 O que muda no processamento da imagem

No desenho original, a Function em Python ocupava o papel de processador técnico assíncrono.

Com a trilha Kubernetes aberta, teremos duas opções conceituais:

- manter um processador em container no cluster
- no futuro comparar isso com uma alternativa serverless da AWS

Para este repositório, a trilha principal recomendada é:

- `api` em container
- `image-processor-function` evoluindo para workload em Kubernetes

Isso mantém coerência com o objetivo de estudar Kubernetes de forma prática.
