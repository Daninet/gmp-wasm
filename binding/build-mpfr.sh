#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f mpfr/Dockerfile . --tag=mpfr-builder
docker run --rm -v $(pwd)/mpfr:/output mpfr-builder cp -R /builder/dist /output
