#!/bin/sh

set -eu

CLUSTER_NAME="${1:-web-socket-lab}"

echo "Step 1/5: checking local prerequisites"
sh infra/scripts/k8s-preflight.sh

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed. Install docker first and try again."
  exit 1
fi

if ! command -v kind >/dev/null 2>&1; then
  echo "kind is not installed. Install kind first and try again."
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is not installed. Install kubectl first and try again."
  exit 1
fi

echo "Step 2/5: building local application images"
docker compose -f docker-compose.yml -f docker-compose.dev.yml build api image-processor-function

echo "Step 3/5: ensuring kind cluster exists"
if kind get clusters | grep -qx "$CLUSTER_NAME"; then
  echo "Cluster already exists: $CLUSTER_NAME"
else
  sh infra/scripts/kind-create-cluster.sh
fi

echo "Step 4/5: loading application images into kind"
sh infra/scripts/kind-load-images.sh "$CLUSTER_NAME"

echo "Step 5/5: preparing env files and applying manifests"
sh infra/scripts/k8s-apply-local-kind.sh

echo "Current Kubernetes state"
kubectl get deployments -n web-socket
kubectl get statefulsets -n web-socket
kubectl get services -n web-socket
kubectl get pvc -n web-socket
kubectl get pods -n web-socket
