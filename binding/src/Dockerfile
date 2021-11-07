FROM emscripten/emsdk:2.0.32

WORKDIR /builder

ENV CFLAGS="-I/builder/libdist/include -O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS}"
ENV LDFLAGS="-L/builder/libdist/lib ${CFLAGS}"

# warm up emscripten cache
RUN embuilder.py build MINIMAL --lto

ADD ./src /builder/src
ADD ./mpc/dist /builder/libdist

RUN emcc ${CXXFLAGS} -c src/entry.c -o src/entry.o
RUN mkdir -p /builder/dist && \
  emcc ${LDFLAGS} \
  -s ENVIRONMENT='web,worker,node' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s WARN_UNALIGNED=1 \
  -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
  -s FILESYSTEM=0 \
  -s ASSERTIONS=0 \
  --emit-symbol-map \
  -lgmp -lmpfr -lmpc \
  src/entry.o \
  -o /builder/dist/gmp.js

# -s STANDALONE_WASM=1 \
# --no-entry \