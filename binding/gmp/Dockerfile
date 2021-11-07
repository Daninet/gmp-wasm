FROM emscripten/emsdk:2.0.32

WORKDIR /builder

RUN wget https://ftp.gnu.org/gnu/gmp/gmp-6.2.1.tar.xz && \
  tar xmf gmp-6.2.1.tar.xz && \
  mkdir -p lib/gmp && mv gmp-6.2.1/* lib/gmp

ENV CFLAGS="-O3 -Oz -flto -fno-rtti -fno-exceptions"
ENV CXXFLAGS="${CFLAGS} -std=c++11"
ENV CPPFLAGS="${CFLAGS} -DNO_ASM"
ENV LDFLAGS="${CFLAGS}"

RUN emconfigure lib/gmp/configure --host none --prefix /builder/dist --disable-assembly --disable-cxx --enable-alloca=notreentrant
RUN make -j6 install
