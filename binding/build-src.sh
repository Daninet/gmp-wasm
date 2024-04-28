#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f src/Dockerfile . --tag=gmp-binding-builder

container_id=$(docker create gmp-binding-builder)
docker cp "$container_id:/builder/dist/" .
docker rm "$container_id"
