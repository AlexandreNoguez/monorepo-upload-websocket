FROM node:22-alpine

WORKDIR /workspace

RUN apk add --no-cache bash curl netcat-openbsd

CMD ["sh", "-c", "echo 'api dev container ready'; tail -f /dev/null"]
