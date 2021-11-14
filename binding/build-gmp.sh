#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f gmp/Dockerfile . --tag=gmp-builder
docker run --rm -v $(pwd)/gmp:/output gmp-builder cp -R /builder/dist /output
