FROM python:3.12-slim AS base

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

COPY infra/docker/function/bin /opt/function/bin

EXPOSE 7071

FROM base AS development

ENV APP_RUNTIME=development
ENV FUNCTION_APP_PORT=7071

CMD ["python", "/opt/function/bin/placeholder_server.py"]

FROM base AS production

ENV APP_RUNTIME=production
ENV FUNCTION_APP_PORT=7071

COPY apps/image-processor-function /workspace/apps/image-processor-function
COPY packages /workspace/packages

CMD ["python", "/opt/function/bin/placeholder_server.py"]
