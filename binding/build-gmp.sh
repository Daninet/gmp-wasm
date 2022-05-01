#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"
mkdir -p gmp/src
mkdir -p gmp/tune

if [ ! -f gmp/src/gmp-6.2.1.tar.xz ]
then
  wget -P gmp/src https://ftp.gnu.org/gnu/gmp/gmp-6.2.1.tar.xz
  tar xmf gmp/src/gmp-6.2.1.tar.xz -C gmp/src
  mv gmp/src/gmp-6.2.1/* gmp/src
fi

docker build -f gmp/Dockerfile . --tag=gmp-builder:latest
docker run --rm -v $(pwd)/gmp:/output gmp-builder:latest /bin/bash -c "
  cp -R /builder/dist /output && \
  cp /builder/lib/gmp/tune/tuneup /output/tune/tuneup.js && \
  cp /builder/lib/gmp/tune/tuneup.wasm /output/tune/tuneup.wasm"
