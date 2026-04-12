#!/bin/sh

set -eu

CLUSTER_NAME="${1:-web-socket-lab}"

if ! command -v kind >/dev/null 2>&1; then
  echo "kind is not installed. Install kind first and try again."
  exit 1
fi

echo "Deleting kind cluster: $CLUSTER_NAME"
kind delete cluster --name "$CLUSTER_NAME"
