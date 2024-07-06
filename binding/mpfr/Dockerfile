FROM emscripten/emsdk:3.1.58

RUN apt-get update && apt-get install -y texinfo automake

WORKDIR /builder

RUN wget https://ftp.gnu.org/gnu/mpfr/mpfr-4.2.1.tar.xz && \
  tar xmf mpfr-4.2.1.tar.xz && \
  mkdir -p lib/mpfr && mv mpfr-4.2.1/* lib/mpfr

ENV CFLAGS="-O3 -Oz -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS} -std=c++11"
ENV CPPFLAGS="${CFLAGS} -DNO_ASM"
ENV LDFLAGS="${CFLAGS}"

COPY ./gmp/dist /builder/dist

RUN emconfigure lib/mpfr/configure --host none --prefix /builder/dist --enable-assert=none --disable-thread-safe --disable-float128 --disable-decimal-float --enable-gmp-internals --with-gmp=/builder/dist
RUN make -j6 install
