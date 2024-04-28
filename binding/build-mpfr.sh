#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f mpfr/Dockerfile . --tag=mpfr-builder

container_id=$(docker create mpfr-builder)
docker cp "$container_id:/builder/dist/" "${cwd}mpfr"
docker rm "$container_id"
