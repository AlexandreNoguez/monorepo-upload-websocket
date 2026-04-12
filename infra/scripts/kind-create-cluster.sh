#!/bin/sh

set -eu

CLUSTER_CONFIG="${1:-infra/k8s/kind/cluster.example.yaml}"

if ! command -v kind >/dev/null 2>&1; then
  echo "kind is not installed. Install kind first and try again."
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is not installed. Install kubectl first and try again."
  exit 1
fi

echo "Creating kind cluster using config: $CLUSTER_CONFIG"
kind create cluster --config "$CLUSTER_CONFIG"

echo "Cluster information"
kubectl cluster-info

echo "Cluster nodes"
kubectl get nodes
