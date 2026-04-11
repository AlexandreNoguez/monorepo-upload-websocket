FROM node:22-alpine AS base

WORKDIR /workspace

RUN apk add --no-cache bash curl netcat-openbsd

COPY infra/docker/api/bin /opt/api/bin

EXPOSE 3000

FROM base AS development

ENV APP_RUNTIME=development
ENV API_PORT=3000

CMD ["node", "/opt/api/bin/placeholder-server.mjs"]

FROM base AS production

ENV APP_RUNTIME=production
ENV API_PORT=3000

COPY package.json pnpm-workspace.yaml /workspace/
COPY apps/api /workspace/apps/api
COPY packages /workspace/packages

CMD ["node", "/opt/api/bin/placeholder-server.mjs"]
