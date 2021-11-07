#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"

docker build -f mpc/Dockerfile . --tag=mpc-builder
docker run --rm -v $(pwd)/mpc:/output mpc-builder cp -R /builder/dist /output
