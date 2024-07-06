FROM emscripten/emsdk:3.1.58

RUN apt-get update && apt-get install -y texinfo

WORKDIR /builder

COPY ./gmp/src lib/gmp

# tuner does not like -flto
ENV CFLAGS="-O3 -Oz -fno-rtti -fno-exceptions -msimd128 -msse2"
ENV CXXFLAGS="${CFLAGS} -std=c++11"
ENV CPPFLAGS="${CFLAGS} -DNO_ASM"
ENV LDFLAGS="${CFLAGS}"
ENV ABI="64 32"
ENV MPN_PATH="generic"

WORKDIR /builder/lib/gmp
COPY ./gmp/tune/gmp-mparam.h mpn/generic/gmp-mparam.h
RUN sed -i 's/abilist=\"standard\"/abilist=\"standard longlong\"\nlimb_longlong=longlong\n/' ./configure
RUN emconfigure ./configure --host none --prefix /builder/dist ABI=longlong --with-readline=no --enable-fft=yes --disable-cxx --enable-alloca=malloc-notreentrant
RUN make -j6 install
# COPY ./gmp/tune/time.c tune/time.c
RUN cd tune && make -j6 tuneup
