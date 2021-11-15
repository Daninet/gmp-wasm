FROM emscripten/emsdk:2.0.32

WORKDIR /builder

ENV CFLAGS="-I/builder/libdist/include -O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS}"
ENV LDFLAGS="-L/builder/libdist/lib ${CFLAGS}"

# warm up emscripten cache
RUN embuilder.py build MINIMAL --lto

ADD ./src /builder/src
ADD ./mpfr/dist /builder/libdist

RUN emcc ${CXXFLAGS} -c src/entry.c -o src/entry.o
RUN mkdir -p /builder/dist && \
  emcc ${LDFLAGS} \
  -s ENVIRONMENT='web,worker,node' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s STANDALONE_WASM=1 \
  -s ERROR_ON_UNDEFINED_SYMBOLS=1 \
  -s AUTO_JS_LIBRARIES=0 \
  -s FILESYSTEM=0 \
  -s ASSERTIONS=0 \
  --no-entry \
  --emit-symbol-map \
  -lgmp -lmpfr \
  src/entry.o \
  -o /builder/dist/gmp.js

# -s STANDALONE_WASM=1 \
# -s MINIMAL_RUNTIME=1
