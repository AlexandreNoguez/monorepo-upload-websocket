FROM python:3.12-slim

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

CMD ["sh", "-c", "echo 'image processor function dev container ready'; tail -f /dev/null"]
