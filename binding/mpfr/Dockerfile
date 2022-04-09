FROM emscripten/emsdk:3.1.8

WORKDIR /builder

RUN wget https://ftp.gnu.org/gnu/mpfr/mpfr-4.1.0.tar.xz && \
  tar xmf mpfr-4.1.0.tar.xz && \
  mkdir -p lib/mpfr && mv mpfr-4.1.0/* lib/mpfr

ENV CFLAGS="-O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS} -std=c++11"
ENV CPPFLAGS="${CFLAGS} -DNO_ASM"
ENV LDFLAGS="${CFLAGS}"

ADD ./gmp/dist /builder/dist

RUN emconfigure lib/mpfr/configure --host none --prefix /builder/dist --disable-thread-safe --enable-decimal-float=no --with-gmp=/builder/dist
RUN make -j6 install
