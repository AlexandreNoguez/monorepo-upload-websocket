#!/bin/sh

set -eu

CLUSTER_NAME="${1:-web-socket-lab}"

if ! command -v kind >/dev/null 2>&1; then
  echo "kind is not installed. Install kind first and try again."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed. Install docker first and try again."
  exit 1
fi

echo "Loading local images into kind cluster: $CLUSTER_NAME"
kind load docker-image web-socket-api:local --name "$CLUSTER_NAME"
kind load docker-image web-socket-image-processor-function:local --name "$CLUSTER_NAME"

echo "Images loaded successfully"
