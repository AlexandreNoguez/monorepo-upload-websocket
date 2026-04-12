#!/bin/sh

set -eu

copy_if_missing() {
  source_file="$1"
  target_file="$2"

  if [ -f "$target_file" ]; then
    echo "Using existing file: $target_file"
    return 0
  fi

  cp "$source_file" "$target_file"
  echo "Created $target_file from $source_file"
}

copy_if_missing \
  "infra/k8s/overlays/local-kind/app-config.env.example" \
  "infra/k8s/overlays/local-kind/app-config.env"

copy_if_missing \
  "infra/k8s/overlays/local-kind/app-secrets.env.example" \
  "infra/k8s/overlays/local-kind/app-secrets.env"
