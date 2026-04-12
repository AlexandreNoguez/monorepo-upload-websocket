#!/bin/sh

set -eu

check_command() {
  command_name="$1"

  if command -v "$command_name" >/dev/null 2>&1; then
    echo "[ok] $command_name found"
  else
    echo "[missing] $command_name not found"
  fi
}

echo "Checking local prerequisites for Kubernetes lab"

check_command docker
check_command kubectl
check_command kind

if command -v docker >/dev/null 2>&1; then
  echo "--- docker version"
  docker --version
fi

if command -v kubectl >/dev/null 2>&1; then
  echo "--- kubectl version"
  kubectl version --client
fi

if command -v kind >/dev/null 2>&1; then
  echo "--- kind version"
  kind version
fi
