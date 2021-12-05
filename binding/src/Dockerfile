FROM emscripten/emsdk:2.0.32

# warm up emscripten cache
RUN embuilder.py build MINIMAL --lto

WORKDIR /builder

ENV CFLAGS="-I/builder/libdist/include -O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS}"
ENV LDFLAGS="-L/builder/libdist/lib ${CFLAGS}"

ENV EMCC_FLAGS="${LDFLAGS} \
  -s ENVIRONMENT='web,worker,node' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s STANDALONE_WASM=1 \
  -s ERROR_ON_UNDEFINED_SYMBOLS=1 \
  -s AUTO_JS_LIBRARIES=0 \
  -s FILESYSTEM=0 \
  -s ASSERTIONS=0 \
  --no-entry \
  --emit-symbol-map"

# -s STANDALONE_WASM=1 \
# -s MINIMAL_RUNTIME=1

ADD ./src /builder/src
ADD ./mpfr/dist /builder/libdist

RUN emcc ${CXXFLAGS} -c src/entry.c -o src/entrymini.o
RUN emcc ${CXXFLAGS} -DGMP_WASM_FULL_LIB -c src/entry.c -o src/entry.o

RUN mkdir -p /builder/dist

RUN emcc ${EMCC_FLAGS} \
  -lgmp \
  src/entrymini.o \
  -o /builder/dist/gmpmini.js

RUN emcc ${EMCC_FLAGS} \
  -lgmp -lmpfr \
  src/entry.o \
  -o /builder/dist/gmp.js
