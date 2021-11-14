#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f src/Dockerfile . --tag=gmp-binding-builder
docker run --rm -v $(pwd):/output gmp-binding-builder cp -R /builder/dist /output
