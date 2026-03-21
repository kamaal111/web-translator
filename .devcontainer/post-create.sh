#!/usr/bin/env bash

set -euo pipefail

workspace_dir="$(pwd)"

paths=(
  "$workspace_dir/node_modules"
  "$workspace_dir/server/node_modules"
  "$workspace_dir/web/node_modules"
  "$workspace_dir/modules/schemas/node_modules"
  "/home/node/.bun/install/cache"
)

sudo mkdir -p "${paths[@]}"
sudo chown -R node:node "${paths[@]}"

if [ ! -f "$workspace_dir/.env" ] && [ -f "$workspace_dir/.env.example" ]; then
  sed 's/@localhost:/@wt_db:/' "$workspace_dir/.env.example" > "$workspace_dir/.env"
fi

just prepare
