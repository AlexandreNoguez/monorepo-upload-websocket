#!/bin/sh

set -eu

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is not installed. Install kubectl first and try again."
  exit 1
fi

echo "Applying local kind overlay"
kubectl apply -k infra/k8s/overlays/local-kind

echo "Current namespace state"
kubectl get namespace web-socket
