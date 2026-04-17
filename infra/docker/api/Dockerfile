FROM node:22-alpine AS base

WORKDIR /workspace

RUN apk add --no-cache bash curl netcat-openbsd
RUN corepack enable

COPY infra/docker/api/bin /opt/api/bin

EXPOSE 3000

FROM base AS dependencies

COPY package.json pnpm-workspace.yaml /workspace/
COPY apps/api/package.json /workspace/apps/api/package.json

RUN pnpm install --filter @web-socket/api... --no-frozen-lockfile

RUN chown -R node:node /workspace/node_modules /workspace/apps/api

FROM dependencies AS development

ENV APP_RUNTIME=development
ENV API_PORT=3000

COPY apps/api /workspace/apps/api
COPY packages /workspace/packages

WORKDIR /workspace/apps/api

CMD ["pnpm", "start:dev"]

FROM dependencies AS build

COPY apps/api /workspace/apps/api
COPY packages /workspace/packages

RUN pnpm --filter @web-socket/api build

FROM base AS production

ENV APP_RUNTIME=production
ENV API_PORT=3000

COPY package.json pnpm-workspace.yaml /workspace/
COPY apps/api/package.json /workspace/apps/api/package.json
COPY packages /workspace/packages

RUN pnpm install --filter @web-socket/api... --prod --no-frozen-lockfile

COPY --from=build /workspace/apps/api/dist /workspace/apps/api/dist

WORKDIR /workspace/apps/api

CMD ["node", "dist/main.js"]
