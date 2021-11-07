FROM emscripten/emsdk:2.0.32

WORKDIR /builder

RUN wget https://ftp.gnu.org/gnu/mpc/mpc-1.2.0.tar.gz && \
  tar xmf mpc-1.2.0.tar.gz && \
  mkdir -p lib/mpc && mv mpc-1.2.0/* lib/mpc

ENV CFLAGS="-O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS} -std=c++11"
ENV CPPFLAGS="${CFLAGS} -DNO_ASM"
ENV LDFLAGS="${CFLAGS}"

ADD ./mpfr/dist /builder/dist

RUN emconfigure lib/mpc/configure --host none --prefix /builder/dist --with-gmp=/builder/dist --with-mpfr=/builder/dist
RUN make -j6 install
