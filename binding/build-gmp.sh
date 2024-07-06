#!/bin/sh
set -e

# set working directory to script location
cd "${0%/*}"
mkdir -p gmp/src
mkdir -p gmp/tune

if [ ! -f gmp/src/gmp-6.3.0.tar.xz ]
then
  wget -P gmp/src https://ftp.gnu.org/gnu/gmp/gmp-6.3.0.tar.xz
  tar xmf gmp/src/gmp-6.3.0.tar.xz -C gmp/src
  mv gmp/src/gmp-6.3.0/* gmp/src
fi

docker build -f gmp/Dockerfile . --tag=gmp-builder:latest

container_id=$(docker create gmp-builder)
docker cp "$container_id:/builder/dist/" "${cwd}gmp"
docker cp "$container_id:/builder/lib/gmp/tune/tuneup" "${cwd}gmp/tune/tuneup.js"
docker cp "$container_id:/builder/lib/gmp/tune/tuneup.wasm" "${cwd}gmp/tune/tuneup.wasm"
docker rm "$container_id"
