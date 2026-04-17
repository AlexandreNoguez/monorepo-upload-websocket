# Fase 5: Modelagem Do Dominio

Esta fase criou o dominio puro da aplicacao.

## 1. Objetivo

O objetivo foi modelar as regras principais antes de criar casos de uso, controllers ou repositories.

Isso e importante porque, em DDD e Clean Architecture, o dominio deve responder perguntas como:

- uma imagem pode mudar para qualquer status?
- um job pode concluir sem ter sido iniciado?
- o progresso pode voltar de 80 para 30?
- um arquivo pode ter MIME type invalido?
- uma referencia de blob pode ser vazia?

Essas regras nao devem depender de NestJS, Prisma, Azure SDK ou banco.

## 2. O que foi criado

### Entidades

- [ImageAsset](/home/alexandre/workspace/web-socket/apps/api/src/domain/image-assets/entities/image-asset.entity.ts)
- [ProcessingJob](/home/alexandre/workspace/web-socket/apps/api/src/domain/processing/entities/processing-job.entity.ts)
- [ProcessedVariant](/home/alexandre/workspace/web-socket/apps/api/src/domain/processing/entities/processed-variant.entity.ts)

### Enums

- [ImageAssetStatus](/home/alexandre/workspace/web-socket/apps/api/src/domain/image-assets/enums/image-asset-status.enum.ts)
- [ProcessingJobStatus](/home/alexandre/workspace/web-socket/apps/api/src/domain/processing/enums/processing-job-status.enum.ts)
- [ProcessedVariantKind](/home/alexandre/workspace/web-socket/apps/api/src/domain/processing/enums/processed-variant-kind.enum.ts)
- [ProcessingEventType](/home/alexandre/workspace/web-socket/apps/api/src/domain/processing/enums/processing-event-type.enum.ts)

### Value objects

- [BlobReference](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/blob-reference.value-object.ts)
- [FileSize](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/file-size.value-object.ts)
- [ImageDimensions](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/image-dimensions.value-object.ts)
- [MimeType](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/mime-type.value-object.ts)
- [OriginalFileName](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/original-file-name.value-object.ts)
- [ProgressPercentage](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/progress-percentage.value-object.ts)
- [UniqueIdentifier](/home/alexandre/workspace/web-socket/apps/api/src/domain/shared/value-objects/unique-identifier.value-object.ts)

## 3. Por que criar value objects

Value objects deixam regras pequenas perto dos dados que elas protegem.

Exemplos:

- `FileSize` impede tamanho menor ou igual a zero.
- `MimeType` limita os tipos aceitos para imagens.
- `ProgressPercentage` impede valores fora de 0 a 100.
- `BlobReference` impede container ou chave vazios.
- `OriginalFileName` impede nome vazio ou grande demais.

Sem value objects, essas regras ficariam espalhadas em controllers, casos de uso ou repositories.

## 4. Invariantes de `ImageAsset`

A entidade `ImageAsset` controla as transicoes principais da imagem.

Transicoes validas:

- `UPLOAD_REQUESTED` para `UPLOADED`
- `UPLOADED` para `PROCESSING`
- `PROCESSING` para `PROCESSED`
- estados ativos para `FAILED`

Transicoes invalidas geram `DomainRuleViolationError`.

Isso evita que uma imagem pule etapas importantes.

## 5. Invariantes de `ProcessingJob`

A entidade `ProcessingJob` controla o ciclo de vida do processamento.

Regras principais:

- somente job `QUEUED` pode iniciar
- somente job `RUNNING` pode reportar progresso
- progresso nao pode voltar ou ficar igual
- progresso `100` deve usar `complete()`
- somente job `RUNNING` pode concluir
- somente job `QUEUED` ou `RUNNING` pode falhar
- falha precisa ter motivo

Essas regras serao usadas pelos casos de uso da Fase 6.

## 6. Por que o dominio nao importa Prisma

As entidades nao importam Prisma.

Isso e intencional.

Prisma representa persistencia. O dominio representa comportamento e regras.

Se o dominio dependesse de Prisma:

- regras ficariam presas ao banco
- testes unitarios seriam mais pesados
- trocar persistencia seria mais dificil
- casos de uso ficariam menos claros

## 7. Como usar nos proximos passos

Na Fase 6, os casos de uso vao criar e manipular essas entidades.

Exemplo conceitual:

```text
SolicitarUploadDeImagem
  cria ImageAsset
  salva via repository
  retorna dados para upload
```

Outro exemplo:

```text
RegistrarProgressoDoProcessamento
  carrega ProcessingJob
  chama reportProgress()
  salva novo estado
```

## 8. Resultado desta fase

Ao final desta etapa, o projeto passa a ter o centro do negocio modelado.

O proximo passo natural e a Fase 6: casos de uso da API.
