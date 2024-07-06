#include <emscripten.h>

EM_JS(void, get_hrtime, (long *tv_sec, long *tv_nsec), {
  let[sec, nsec] = process.hrtime();
  HEAPU32[tv_sec >> 2] = sec;
  HEAPU32[tv_nsec >> 2] = nsec;
});

int clock_getres2(clockid_t clk_id, struct timespec *res) {
  res->tv_sec = 0;
  res->tv_nsec = 1;
  return 0;
}

int clock_gettime2(clockid_t clk_id, struct timespec *tp) {
  get_hrtime(&tp->tv_sec, &tp->tv_nsec);
  return 0;
}
