#!/bin/sh

set -eu

echo "Validating api -> postgres"
docker compose exec -T api sh -lc "nc -z postgres 5432"

echo "Validating api -> azurite"
docker compose exec -T api sh -lc "nc -z azurite 10000"

echo "Validating function -> postgres"
docker compose exec -T image-processor-function sh -lc "nc -z postgres 5432"

echo "Validating function -> azurite"
docker compose exec -T image-processor-function sh -lc "nc -z azurite 10000"

echo "Network validation completed successfully"
