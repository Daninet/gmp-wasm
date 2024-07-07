## 1.3.2 (July 7, 2024)
* Fix ArrayView being detached

## 1.3.1 (July 6, 2024)
* Use Node.js v20

## 1.3.0 (July 6, 2024)
* Removed truncate parameter from toString()
* Added toInterval()
* Fixed bug with string formatting and removal of trailing zeros
* Update GMP version to 6.3.0
* Update MPFR version to 4.2.1
* Update Emscripten

## 1.2.0 (May 1, 2022)
* Add truncate parameter to Float().toString() and mpfr_to_string()
* Change default float precision to 53 (previously it was 52) to match double type
* Performance improvements. Custom tuning for GMP
* Remove some rarely used functions like mpfr_get_patches() to make the bundle smaller

## 1.1.0 (Apr 22, 2022)
* Rename mpfr_get_pretty_string() to mpfr_to_string()
* Add mpz_to_string() and mpq_to_string() helpers
* Add mpz_set_string(), mpz_init_set_string(), mpq_set_string(), mpfr_set_string(), mpfr_init_set_string() helpers
* Add radix parameter to Rational.toString()

## 1.0.2 (Apr 18, 2022)
* Add missing mpq_numref(), mpq_denref() functions
* Add mpfr_get_pretty_string() function

## 1.0.1 (Apr 9, 2022)
* Fix path of TS type declarations

## 1.0.0 (Apr 9, 2022)
* **BREAKING CHANGES**:
  * exponent2() was renamed to exponent()
  * isPrime() was renamed to isProbablyPrime()
* New documentation based on TypeDoc
* More strict TS types
* Update all dependencies

## 0.9.4 (Dec 21, 2021)
* Fix uninitialized usage of mpz_t (by Yuri Stuken)

## 0.9.3 (Dec 17, 2021)
* Support setting radix for Float string operations (by Yuri Stuken)

## 0.9.2 (Dec 5, 2021)
* Add mini bundle without Float / MPFR functions

## 0.9.1 (Dec 4, 2021)
* Accept string parameter for common operations in the high level wrapper
* Add toFixed() to floats
* Use JS representation of @NaN@ and @Inf@, when serializing into a string
* Add toFloat(), toRational(), toInteger() methods
