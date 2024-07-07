/*!
 * gmp-wasm v1.3.2 (https://www.npmjs.com/package/gmp-wasm)
 * (c) Dani Biro
 * @license LGPL-3.0
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.gmp = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function isUint32(num) {
        return Number.isSafeInteger(num) && num >= 0 && num < Math.pow(2, 32);
    }
    function assertUint32(num) {
        if (!isUint32(num)) {
            throw new Error("Invalid number specified: uint32_t is required");
        }
    }
    function isInt32(num) {
        return (Number.isSafeInteger(num) &&
            num >= -Math.pow(2, 31) &&
            num < Math.pow(2, 31));
    }
    function assertInt32(num) {
        if (!isInt32(num)) {
            throw new Error("Invalid number specified: int32_t is required");
        }
    }
    function assertArray(arr) {
        if (!Array.isArray(arr)) {
            throw new Error("Invalid parameter specified. Array is required!");
        }
    }
    function isValidRadix(radix) {
        return Number.isSafeInteger(radix) && radix >= 2 && radix <= 36;
    }
    function assertValidRadix(radix) {
        if (!isValidRadix(radix)) {
            throw new Error("radix must have a value between 2 and 36");
        }
    }
    const FLOAT_SPECIAL_VALUES = {
        "@NaN@": "NaN",
        "@Inf@": "Infinity",
        "-@Inf@": "-Infinity",
    };
    const FLOAT_SPECIAL_VALUE_KEYS = Object.keys(FLOAT_SPECIAL_VALUES);
    const trimTrailingZeros = (num) => {
        if (num.indexOf('.') === -1)
            return num;
        let pos = num.length - 1;
        while (pos >= 0) {
            if (num[pos] === ".") {
                pos--;
                break;
            }
            else if (num[pos] === "0") {
                pos--;
            }
            else {
                break;
            }
        }
        const rem = num.slice(0, pos + 1);
        if (rem === "-") {
            return "-0";
        }
        else if (rem.length === 0) {
            return "0";
        }
        return rem;
    };
    const insertDecimalPoint = (mantissa, pointPos) => {
        const isNegative = mantissa.startsWith("-");
        const mantissaWithoutSign = isNegative ? mantissa.slice(1) : mantissa;
        const sign = isNegative ? "-" : "";
        let hasDecimalPoint = false;
        if (pointPos <= 0) {
            const zeros = "0".repeat(-pointPos);
            mantissa = `${sign}0.${zeros}${mantissaWithoutSign}`;
            hasDecimalPoint = true;
        }
        else if (pointPos < mantissaWithoutSign.length) {
            mantissa = `${sign}${mantissaWithoutSign.slice(0, pointPos)}.${mantissaWithoutSign.slice(pointPos)}`;
            hasDecimalPoint = true;
        }
        else {
            const zeros = "0".repeat(pointPos - mantissaWithoutSign.length);
            mantissa = `${mantissa}${zeros}`;
        }
        // trim trailing zeros after decimal point
        if (hasDecimalPoint) {
            mantissa = trimTrailingZeros(mantissa);
        }
        return mantissa;
    };

    // matches mpfr_rnd_t
    /** Represents the different rounding modes. */
    exports.FloatRoundingMode = void 0;
    (function (FloatRoundingMode) {
        /** Round to nearest, with ties to even. MPFR_RNDN */
        FloatRoundingMode[FloatRoundingMode["ROUND_NEAREST"] = 0] = "ROUND_NEAREST";
        /** Round toward zero. MPFR_RNDZ */
        FloatRoundingMode[FloatRoundingMode["ROUND_TO_ZERO"] = 1] = "ROUND_TO_ZERO";
        /** Round toward +Infinity. MPFR_RNDU */
        FloatRoundingMode[FloatRoundingMode["ROUND_UP"] = 2] = "ROUND_UP";
        /** Round toward -Infinity. MPFR_RNDD */
        FloatRoundingMode[FloatRoundingMode["ROUND_DOWN"] = 3] = "ROUND_DOWN";
        /** Round away from zero. MPFR_RNDA */
        FloatRoundingMode[FloatRoundingMode["ROUND_FROM_ZERO"] = 4] = "ROUND_FROM_ZERO";
        // /** (Experimental) Faithful rounding. MPFR_RNDF */
        // ROUND_FAITHFUL = 5,
        // /** (Experimental) Round to nearest, with ties away from zero. MPFR_RNDNA */
        // ROUND_TO_NEAREST_AWAY_FROM_ZERO = -1,
    })(exports.FloatRoundingMode || (exports.FloatRoundingMode = {}));
    const INVALID_PARAMETER_ERROR$2 = 'Invalid parameter!';
    function getFloatContext(gmp, ctx, ctxOptions) {
        var _a, _b, _c;
        const mpfr_t_arr = [];
        const isInteger = (val) => ctx.intContext.isInteger(val);
        const isRational = (val) => ctx.rationalContext.isRational(val);
        const isFloat = (val) => ctx.floatContext.isFloat(val);
        const globalRndMode = ((_a = ctxOptions.roundingMode) !== null && _a !== void 0 ? _a : exports.FloatRoundingMode.ROUND_NEAREST);
        const globalPrecisionBits = (_b = ctxOptions.precisionBits) !== null && _b !== void 0 ? _b : 53; // double precision by default
        const globalRadix = (_c = ctxOptions.radix) !== null && _c !== void 0 ? _c : 10;
        assertUint32(globalPrecisionBits);
        assertValidRadix(globalRadix);
        const compare = (mpfr_t, val) => {
            if (typeof val === 'number') {
                assertInt32(val);
                return gmp.mpfr_cmp_si(mpfr_t, val);
            }
            if (typeof val === 'string') {
                const f = FloatFn(val, ctxOptions);
                return gmp.mpfr_cmp(mpfr_t, f.mpfr_t);
            }
            if (isInteger(val)) {
                return gmp.mpfr_cmp_z(mpfr_t, val.mpz_t);
            }
            if (isRational(val)) {
                return gmp.mpfr_cmp_q(mpfr_t, val.mpq_t);
            }
            if (isFloat(val)) {
                return gmp.mpfr_cmp(mpfr_t, val.mpfr_t);
            }
            throw new Error(INVALID_PARAMETER_ERROR$2);
        };
        const mergeFloatOptions = (options1, options2) => {
            var _a, _b, _c, _d, _e, _f;
            const precisionBits1 = (_a = options1 === null || options1 === void 0 ? void 0 : options1.precisionBits) !== null && _a !== void 0 ? _a : globalPrecisionBits;
            const precisionBits2 = (_b = options2 === null || options2 === void 0 ? void 0 : options2.precisionBits) !== null && _b !== void 0 ? _b : globalPrecisionBits;
            return {
                precisionBits: Math.max(precisionBits1, precisionBits2),
                roundingMode: (_d = (_c = options2 === null || options2 === void 0 ? void 0 : options2.roundingMode) !== null && _c !== void 0 ? _c : options1.roundingMode) !== null && _d !== void 0 ? _d : ctxOptions.roundingMode,
                radix: (_f = (_e = options2 === null || options2 === void 0 ? void 0 : options2.radix) !== null && _e !== void 0 ? _e : options1.radix) !== null && _f !== void 0 ? _f : ctxOptions.radix,
            };
        };
        const FloatPrototype = {
            mpfr_t: 0,
            precisionBits: -1,
            rndMode: -1,
            radix: -1,
            type: 'float',
            get options() {
                var _a, _b, _c;
                return {
                    precisionBits: (_a = this.precisionBits) !== null && _a !== void 0 ? _a : globalPrecisionBits,
                    roundingMode: (_b = this.rndMode) !== null && _b !== void 0 ? _b : globalRndMode,
                    radix: (_c = this.radix) !== null && _c !== void 0 ? _c : globalRadix,
                };
            },
            get setOptions() {
                return {
                    precisionBits: this.precisionBits,
                    roundingMode: this.rndMode,
                    radix: this.radix,
                };
            },
            /** Returns the sum of this number and the given one. */
            add(val) {
                if (typeof val === 'number') {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_add_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = FloatFn(val, this.options);
                    gmp.mpfr_add(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
                    return n;
                }
                if (isFloat(val)) {
                    const n = FloatFn(null, mergeFloatOptions(this.setOptions, val.setOptions));
                    gmp.mpfr_add(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
                    return n;
                }
                if (isRational(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_add_q(n.mpfr_t, this.mpfr_t, val.mpq_t, this.rndMode);
                    return n;
                }
                if (isInteger(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_add_z(n.mpfr_t, this.mpfr_t, val.mpz_t, this.rndMode);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$2);
            },
            /** Returns the difference of this number and the given one. */
            sub(val) {
                if (typeof val === 'number') {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_sub_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = FloatFn(val, this.options);
                    gmp.mpfr_sub(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
                    return n;
                }
                if (isFloat(val)) {
                    const n = FloatFn(null, mergeFloatOptions(this.setOptions, val.setOptions));
                    gmp.mpfr_sub(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
                    return n;
                }
                if (isRational(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_sub_q(n.mpfr_t, this.mpfr_t, val.mpq_t, this.rndMode);
                    return n;
                }
                if (isInteger(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_sub_z(n.mpfr_t, this.mpfr_t, val.mpz_t, this.rndMode);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$2);
            },
            /** Returns the product of this number and the given one. */
            mul(val) {
                if (typeof val === 'number') {
                    const n = FloatFn(null, this.options);
                    if (isInt32(val)) {
                        gmp.mpfr_mul_si(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    }
                    else {
                        gmp.mpfr_mul_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    }
                    return n;
                }
                if (typeof val === 'string') {
                    const n = FloatFn(val, this.options);
                    gmp.mpfr_mul(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
                    return n;
                }
                if (isFloat(val)) {
                    const n = FloatFn(null, mergeFloatOptions(this.setOptions, val.setOptions));
                    gmp.mpfr_mul(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
                    return n;
                }
                if (isRational(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_mul_q(n.mpfr_t, this.mpfr_t, val.mpq_t, this.rndMode);
                    return n;
                }
                if (isInteger(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_mul_z(n.mpfr_t, this.mpfr_t, val.mpz_t, this.rndMode);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$2);
            },
            /** Returns the result of the division of this number by the given one. */
            div(val) {
                if (typeof val === 'number') {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_div_d(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = FloatFn(val, this.options);
                    gmp.mpfr_div(n.mpfr_t, this.mpfr_t, n.mpfr_t, this.rndMode);
                    return n;
                }
                if (isFloat(val)) {
                    const n = FloatFn(null, mergeFloatOptions(this.setOptions, val.setOptions));
                    gmp.mpfr_div(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
                    return n;
                }
                if (isRational(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_div_q(n.mpfr_t, this.mpfr_t, val.mpq_t, this.rndMode);
                    return n;
                }
                if (isInteger(val)) {
                    const n = FloatFn(null, this.options);
                    gmp.mpfr_div_z(n.mpfr_t, this.mpfr_t, val.mpz_t, this.rndMode);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$2);
            },
            /** Returns the square root. */
            sqrt() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the reciprocal square root. */
            invSqrt() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_rec_sqrt(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the cube root. */
            cbrt() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_cbrt(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the n-th root. */
            nthRoot(nth) {
                const n = FloatFn(null, this.options);
                assertUint32(nth);
                gmp.mpfr_rootn_ui(n.mpfr_t, this.mpfr_t, nth, this.rndMode);
                return n;
            },
            /** Returns the number with inverted sign. */
            neg() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_neg(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the absolute value. */
            abs() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_abs(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the factorial */
            factorial() {
                const n = FloatFn(null, this.options);
                if (gmp.mpfr_fits_uint_p(this.mpfr_t, this.rndMode) === 0) {
                    throw new Error('Invalid value for factorial()');
                }
                const value = gmp.mpfr_get_ui(this.mpfr_t, this.rndMode);
                gmp.mpfr_fac_ui(n.mpfr_t, value, this.rndMode);
                return n;
            },
            /** Returns true if the number is an integer */
            isInteger() {
                return gmp.mpfr_integer_p(this.mpfr_t) !== 0;
            },
            /** Returns true if the number is zero */
            isZero() {
                return gmp.mpfr_zero_p(this.mpfr_t) !== 0;
            },
            /** Returns true if the number is a regular number (i.e., neither NaN, nor an infinity nor zero) */
            isRegular() {
                return gmp.mpfr_regular_p(this.mpfr_t) !== 0;
            },
            /** Return true if the number is an ordinary number (i.e., neither NaN nor an infinity) */
            isNumber() {
                return gmp.mpfr_number_p(this.mpfr_t) !== 0;
            },
            /** Returns true if the number is an infinity */
            isInfinite() {
                return gmp.mpfr_inf_p(this.mpfr_t) !== 0;
            },
            /** Returns true if the number is NaN */
            isNaN() {
                return gmp.mpfr_nan_p(this.mpfr_t) !== 0;
            },
            /** Returns true if the current number is equal to the provided number */
            isEqual(val) {
                return compare(this.mpfr_t, val) === 0;
            },
            /** Returns true if the current number is less than the provided number */
            lessThan(val) {
                return compare(this.mpfr_t, val) < 0;
            },
            /** Returns true if the current number is less than or equal to the provided number */
            lessOrEqual(val) {
                return compare(this.mpfr_t, val) <= 0;
            },
            /** Returns true if the current number is greater than the provided number */
            greaterThan(val) {
                return compare(this.mpfr_t, val) > 0;
            },
            /** Returns true if the current number is greater than or equal to the provided number */
            greaterOrEqual(val) {
                return compare(this.mpfr_t, val) >= 0;
            },
            /** Returns the natural logarithm */
            ln() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_log(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the base 2 logarithm */
            log2() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_log2(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the base 10 logarithm */
            log10() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_log10(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the exponential (e^x) */
            exp() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_exp(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns 2 to the power of current number (2^x) */
            exp2() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_exp2(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns 10 to the power of current number (10^x) */
            exp10() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_exp10(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns this number exponentiated to the given value. */
            pow(val) {
                const n = FloatFn(null, this.options);
                if (typeof val === 'number') {
                    if (isInt32(val)) {
                        gmp.mpfr_pow_si(n.mpfr_t, this.mpfr_t, val, this.rndMode);
                    }
                    else {
                        gmp.mpfr_pow(n.mpfr_t, this.mpfr_t, FloatFn(val).mpfr_t, this.rndMode);
                    }
                }
                else {
                    gmp.mpfr_pow(n.mpfr_t, this.mpfr_t, val.mpfr_t, this.rndMode);
                }
                return n;
            },
            /** Returns the sine */
            sin() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_sin(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the cosine */
            cos() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_cos(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the tangent */
            tan() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_tan(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the secant */
            sec() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_sec(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the cosecant */
            csc() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_csc(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the cotangent */
            cot() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_cot(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the arc-cosine */
            acos() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_acos(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the arc-sine */
            asin() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_asin(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the arc-tangent */
            atan() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_atan(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic sine */
            sinh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_sinh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic cosine */
            cosh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_cosh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic tangent */
            tanh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_tanh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic secant */
            sech() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_sech(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic cosecant */
            csch() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_csch(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the hyperbolic cotangent */
            coth() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_coth(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the inverse hyperbolic cosine */
            acosh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_acosh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the inverse hyperbolic sine */
            asinh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_asinh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the inverse hyperbolic tangent */
            atanh() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_atanh(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate exponential integral */
            eint() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_eint(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the real part of the dilogarithm (the integral of -log(1-t)/t from 0 to op) */
            li2() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_li2(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the Gamma function. */
            gamma() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_gamma(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the logarithm of the absolute value of the Gamma function */
            lngamma() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_lngamma(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the Digamma (sometimes also called Psi) function */
            digamma() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_digamma(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the Beta function */
            beta(op2) {
                if (!isFloat(op2)) {
                    throw new Error('Only floats parameters are supported!');
                }
                const n = FloatFn(null, this.options);
                gmp.mpfr_beta(n.mpfr_t, this.mpfr_t, op2.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the Riemann Zeta function */
            zeta() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_zeta(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the error function */
            erf() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_erf(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the complementary error function */
            erfc() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_erfc(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the first kind Bessel function of order 0 */
            j0() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_j0(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the first kind Bessel function of order 1 */
            j1() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_j1(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the first kind Bessel function of order n */
            jn(n) {
                assertInt32(n);
                const rop = FloatFn(null, this.options);
                gmp.mpfr_jn(rop.mpfr_t, n, this.mpfr_t, this.rndMode);
                return rop;
            },
            /** Calculate the value of the second kind Bessel function of order 0 */
            y0() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_y0(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the second kind Bessel function of order 1 */
            y1() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_y1(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the second kind Bessel function of order n */
            yn(n) {
                assertInt32(n);
                const rop = FloatFn(null, this.options);
                gmp.mpfr_yn(rop.mpfr_t, n, this.mpfr_t, this.rndMode);
                return rop;
            },
            /** Calculate the arithmetic-geometric mean */
            agm(op2) {
                if (!isFloat(op2)) {
                    throw new Error('Only floats parameters are supported!');
                }
                const n = FloatFn(null, this.options);
                gmp.mpfr_agm(n.mpfr_t, this.mpfr_t, op2.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of the Airy function Ai on x */
            ai() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_ai(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Returns the sign of the current value (-1 or 0 or 1) */
            sign() {
                return gmp.mpfr_sgn(this.mpfr_t);
            },
            /** Converts current value into a JavaScript number */
            toNumber() {
                return gmp.mpfr_get_d(this.mpfr_t, this.rndMode);
            },
            /** Rounds to the next higher or equal representable integer */
            ceil() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_ceil(n.mpfr_t, this.mpfr_t);
                return n;
            },
            /** Rounds to the next lower or equal representable integer */
            floor() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_floor(n.mpfr_t, this.mpfr_t);
                return n;
            },
            /** Rounds to the nearest representable integer, rounding halfway cases away from zero */
            round() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_round(n.mpfr_t, this.mpfr_t);
                return n;
            },
            /** Rounds to the nearest representable integer, rounding halfway cases with the even-rounding rule */
            roundEven() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_roundeven(n.mpfr_t, this.mpfr_t);
                return n;
            },
            /** Rounds to the next representable integer toward zero */
            trunc() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_trunc(n.mpfr_t, this.mpfr_t);
                return n;
            },
            /** Round to precision */
            roundTo(prec) {
                assertUint32(prec);
                const n = FloatFn(this, this.options);
                gmp.mpfr_prec_round(this.mpfr_t, prec, this.rndMode);
                return n;
            },
            /** Returns the fractional part */
            frac() {
                const n = FloatFn(null, this.options);
                gmp.mpfr_frac(n.mpfr_t, this.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded toward zero */
            fmod(y) {
                if (!isFloat(y)) {
                    throw new Error('Only floats parameters are supported!');
                }
                const n = FloatFn(null, this.options);
                gmp.mpfr_fmod(n.mpfr_t, this.mpfr_t, y.mpfr_t, this.rndMode);
                return n;
            },
            /** Calculate the value of x - ny, where n is the integer quotient of x divided by y; n is rounded to the nearest integer (ties rounded to even) */
            remainder(y) {
                if (!isFloat(y)) {
                    throw new Error('Only floats parameters are supported!');
                }
                const n = FloatFn(null, this.options);
                gmp.mpfr_remainder(n.mpfr_t, this.mpfr_t, y.mpfr_t, this.rndMode);
                return n;
            },
            /** Return next value towards +∞ */
            nextAbove() {
                const n = FloatFn(this, this.options);
                gmp.mpfr_nextabove(n.mpfr_t);
                return n;
            },
            /** Return next value towards -∞ */
            nextBelow() {
                const n = FloatFn(this, this.options);
                gmp.mpfr_nextbelow(n.mpfr_t);
                return n;
            },
            /** Returns the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2, 1). */
            exponent() {
                return gmp.mpfr_get_exp(this.mpfr_t);
            },
            /** Converts the number to string */
            toString(radix) {
                radix = radix !== null && radix !== void 0 ? radix : this.options.radix;
                assertValidRadix(radix);
                const str = gmp.mpfr_to_string(this.mpfr_t, radix, this.rndMode);
                return str;
            },
            /** Formats the number using fixed-point notation */
            toFixed(digits = 0, radix) {
                assertUint32(digits);
                radix = radix !== null && radix !== void 0 ? radix : this.options.radix;
                assertValidRadix(radix);
                const str = this.toString(radix);
                if (Object.values(FLOAT_SPECIAL_VALUES).includes(str)) {
                    return str;
                }
                if (digits === 0) {
                    return ctx.intContext.Integer(this).toString(radix);
                }
                let multiplier = null;
                if (radix === 2) {
                    multiplier = FloatFn(digits).exp2();
                }
                else if (radix === 10) {
                    multiplier = FloatFn(digits).exp10();
                }
                else {
                    multiplier = FloatFn(radix).pow(digits);
                }
                const multiplied = this.mul(multiplier);
                const int = ctx.intContext.Integer(multiplied);
                const isNegative = int.sign() === -1;
                let intStr = int.abs().toString(radix);
                if (intStr.length < digits + 1) {
                    intStr = '0'.repeat(digits + 1 - intStr.length) + intStr;
                }
                return `${isNegative ? '-' : ''}${intStr.slice(0, -digits)}.${intStr.slice(-digits)}`;
            },
            /** Converts the number to an integer */
            toInteger() {
                return ctx.intContext.Integer(this);
            },
            /** Get error intervals */
            toInterval() {
                return [this.nextBelow(), this.nextAbove()];
            },
            /** Converts the number to a rational number */
            toRational() {
                return ctx.rationalContext.Rational(this);
            },
        };
        const setValue = (mpfr_t, rndMode, radix, val) => {
            if (typeof val === 'string') {
                const res = gmp.mpfr_set_string(mpfr_t, val, radix, rndMode);
                if (res !== 0) {
                    throw new Error('Invalid number provided!');
                }
                return;
            }
            if (typeof val === 'number') {
                if (isInt32(val)) {
                    gmp.mpfr_set_si(mpfr_t, val, rndMode);
                    if (Object.is(val, -0)) {
                        gmp.mpfr_neg(mpfr_t, mpfr_t, rndMode);
                    }
                }
                else {
                    gmp.mpfr_set_d(mpfr_t, val, rndMode);
                }
                return;
            }
            if (isFloat(val)) {
                gmp.mpfr_set(mpfr_t, val.mpfr_t, rndMode);
                return;
            }
            if (isRational(val)) {
                gmp.mpfr_set_q(mpfr_t, val.mpq_t, rndMode);
                return;
            }
            if (isInteger(val)) {
                gmp.mpfr_set_z(mpfr_t, val.mpz_t, rndMode);
                return;
            }
            throw new Error(INVALID_PARAMETER_ERROR$2);
        };
        const FloatFn = (val, options) => {
            var _a, _b, _c;
            const rndMode = ((_a = options === null || options === void 0 ? void 0 : options.roundingMode) !== null && _a !== void 0 ? _a : globalRndMode);
            const precisionBits = (_b = options === null || options === void 0 ? void 0 : options.precisionBits) !== null && _b !== void 0 ? _b : globalPrecisionBits;
            const radix = (_c = options === null || options === void 0 ? void 0 : options.radix) !== null && _c !== void 0 ? _c : globalRadix;
            assertValidRadix(radix);
            const instance = Object.create(FloatPrototype);
            instance.rndMode = rndMode;
            instance.precisionBits = precisionBits;
            instance.radix = radix;
            instance.mpfr_t = gmp.mpfr_t();
            gmp.mpfr_init2(instance.mpfr_t, precisionBits);
            if (val !== undefined && val !== null) {
                setValue(instance.mpfr_t, rndMode, radix, val);
            }
            mpfr_t_arr.push(instance.mpfr_t);
            return instance;
        };
        return {
            Float: FloatFn,
            isFloat: (val) => FloatPrototype.isPrototypeOf(val),
            Pi: (options) => {
                var _a;
                const n = FloatFn(null, options);
                gmp.mpfr_const_pi(n.mpfr_t, ((_a = options === null || options === void 0 ? void 0 : options.roundingMode) !== null && _a !== void 0 ? _a : globalRndMode));
                return n;
            },
            EulerConstant: (options) => {
                var _a;
                const n = FloatFn(null, options);
                gmp.mpfr_const_euler(n.mpfr_t, ((_a = options === null || options === void 0 ? void 0 : options.roundingMode) !== null && _a !== void 0 ? _a : globalRndMode));
                return n;
            },
            EulerNumber: (options) => {
                return FloatFn(1, options).exp();
            },
            Log2: (options) => {
                var _a;
                const n = FloatFn(null, options);
                gmp.mpfr_const_log2(n.mpfr_t, ((_a = options === null || options === void 0 ? void 0 : options.roundingMode) !== null && _a !== void 0 ? _a : globalRndMode));
                return n;
            },
            Catalan: (options) => {
                var _a;
                const n = FloatFn(null, options);
                gmp.mpfr_const_catalan(n.mpfr_t, ((_a = options === null || options === void 0 ? void 0 : options.roundingMode) !== null && _a !== void 0 ? _a : globalRndMode));
                return n;
            },
            destroy: () => {
                for (let i = mpfr_t_arr.length - 1; i >= 0; i--) {
                    gmp.mpfr_clear(mpfr_t_arr[i]);
                    gmp.mpfr_t_free(mpfr_t_arr[i]);
                }
                mpfr_t_arr.length = 0;
            }
        };
    }

    // DEFLATE is a complex format; to read this code, you should probably check the RFC first:

    // aliases for shorter compressed code (most minifers don't do this)
    var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
    // fixed length extra bits
    var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
    // fixed distance extra bits
    // see fleb note
    var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
    // code length index map
    var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    // get base, reverse index map from extra bits
    var freb = function (eb, start) {
        var b = new u16(31);
        for (var i = 0; i < 31; ++i) {
            b[i] = start += 1 << eb[i - 1];
        }
        // numbers here are at max 18 bits
        var r = new u32(b[30]);
        for (var i = 1; i < 30; ++i) {
            for (var j = b[i]; j < b[i + 1]; ++j) {
                r[j] = ((j - b[i]) << 5) | i;
            }
        }
        return [b, r];
    };
    var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
    // we can ignore the fact that the other numbers are wrong; they never happen anyway
    fl[28] = 258, revfl[258] = 28;
    var _b = freb(fdeb, 0), fd = _b[0];
    // map of value to reverse (assuming 16 bits)
    var rev = new u16(32768);
    for (var i = 0; i < 32768; ++i) {
        // reverse table algorithm from SO
        var x = ((i & 0xAAAA) >>> 1) | ((i & 0x5555) << 1);
        x = ((x & 0xCCCC) >>> 2) | ((x & 0x3333) << 2);
        x = ((x & 0xF0F0) >>> 4) | ((x & 0x0F0F) << 4);
        rev[i] = (((x & 0xFF00) >>> 8) | ((x & 0x00FF) << 8)) >>> 1;
    }
    // create huffman tree from u8 "map": index -> code length for code index
    // mb (max bits) must be at most 15
    // TODO: optimize/split up?
    var hMap = (function (cd, mb, r) {
        var s = cd.length;
        // index
        var i = 0;
        // u16 "map": index -> # of codes with bit length = index
        var l = new u16(mb);
        // length of cd must be 288 (total # of codes)
        for (; i < s; ++i) {
            if (cd[i])
                ++l[cd[i] - 1];
        }
        // u16 "map": index -> minimum code for bit length = index
        var le = new u16(mb);
        for (i = 0; i < mb; ++i) {
            le[i] = (le[i - 1] + l[i - 1]) << 1;
        }
        var co;
        if (r) {
            // u16 "map": index -> number of actual bits, symbol for code
            co = new u16(1 << mb);
            // bits to remove for reverser
            var rvb = 15 - mb;
            for (i = 0; i < s; ++i) {
                // ignore 0 lengths
                if (cd[i]) {
                    // num encoding both symbol and bits read
                    var sv = (i << 4) | cd[i];
                    // free bits
                    var r_1 = mb - cd[i];
                    // start value
                    var v = le[cd[i] - 1]++ << r_1;
                    // m is end value
                    for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                        // every 16 bit value starting with the code yields the same result
                        co[rev[v] >>> rvb] = sv;
                    }
                }
            }
        }
        else {
            co = new u16(s);
            for (i = 0; i < s; ++i) {
                if (cd[i]) {
                    co[i] = rev[le[cd[i] - 1]++] >>> (15 - cd[i]);
                }
            }
        }
        return co;
    });
    // fixed length tree
    var flt = new u8(288);
    for (var i = 0; i < 144; ++i)
        flt[i] = 8;
    for (var i = 144; i < 256; ++i)
        flt[i] = 9;
    for (var i = 256; i < 280; ++i)
        flt[i] = 7;
    for (var i = 280; i < 288; ++i)
        flt[i] = 8;
    // fixed distance tree
    var fdt = new u8(32);
    for (var i = 0; i < 32; ++i)
        fdt[i] = 5;
    // fixed length map
    var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
    // fixed distance map
    var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
    // find max of array
    var max = function (a) {
        var m = a[0];
        for (var i = 1; i < a.length; ++i) {
            if (a[i] > m)
                m = a[i];
        }
        return m;
    };
    // read d, starting at bit p and mask with m
    var bits = function (d, p, m) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
    };
    // read d, starting at bit p continuing for at least 16 bits
    var bits16 = function (d, p) {
        var o = (p / 8) | 0;
        return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
    };
    // get end of byte
    var shft = function (p) { return ((p + 7) / 8) | 0; };
    // typed array slice - allows garbage collector to free original reference,
    // while being more compatible than .slice
    var slc = function (v, s, e) {
        if (s == null || s < 0)
            s = 0;
        if (e == null || e > v.length)
            e = v.length;
        // can't use .constructor in case user-supplied
        var n = new (v.BYTES_PER_ELEMENT == 2 ? u16 : v.BYTES_PER_ELEMENT == 4 ? u32 : u8)(e - s);
        n.set(v.subarray(s, e));
        return n;
    };
    // error codes
    var ec = [
        'unexpected EOF',
        'invalid block type',
        'invalid length/literal',
        'invalid distance',
        'stream finished',
        'no stream handler',
        ,
        'no callback',
        'invalid UTF-8 data',
        'extra field too long',
        'date not in range 1980-2099',
        'filename too long',
        'stream finishing',
        'invalid zip data'
        // determined by unknown compression method
    ];
    var err = function (ind, msg, nt) {
        var e = new Error(msg || ec[ind]);
        e.code = ind;
        if (Error.captureStackTrace)
            Error.captureStackTrace(e, err);
        if (!nt)
            throw e;
        return e;
    };
    // expands raw DEFLATE data
    var inflt = function (dat, buf, st) {
        // source length
        var sl = dat.length;
        if (!sl || (st && st.f && !st.l))
            return buf || new u8(0);
        // have to estimate size
        var noBuf = !buf || st;
        // no state
        var noSt = !st || st.i;
        if (!st)
            st = {};
        // Assumes roughly 33% compression ratio average
        if (!buf)
            buf = new u8(sl * 3);
        // ensure buffer can fit at least l elements
        var cbuf = function (l) {
            var bl = buf.length;
            // need to increase size to fit
            if (l > bl) {
                // Double or set to necessary, whichever is greater
                var nbuf = new u8(Math.max(bl * 2, l));
                nbuf.set(buf);
                buf = nbuf;
            }
        };
        //  last chunk         bitpos           bytes
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        // total bits
        var tbts = sl * 8;
        do {
            if (!lm) {
                // BFINAL - this is only 1 when last chunk is next
                final = bits(dat, pos, 1);
                // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
                var type = bits(dat, pos + 1, 3);
                pos += 3;
                if (!type) {
                    // go to end of byte boundary
                    var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                    if (t > sl) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    // ensure size
                    if (noBuf)
                        cbuf(bt + l);
                    // Copy over uncompressed data
                    buf.set(dat.subarray(s, t), bt);
                    // Get new bitpos, update byte count
                    st.b = bt += l, st.p = pos = t * 8, st.f = final;
                    continue;
                }
                else if (type == 1)
                    lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
                else if (type == 2) {
                    //  literal                            lengths
                    var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                    var tl = hLit + bits(dat, pos + 5, 31) + 1;
                    pos += 14;
                    // length+distance tree
                    var ldt = new u8(tl);
                    // code length tree
                    var clt = new u8(19);
                    for (var i = 0; i < hcLen; ++i) {
                        // use index map to get real code
                        clt[clim[i]] = bits(dat, pos + i * 3, 7);
                    }
                    pos += hcLen * 3;
                    // code lengths bits
                    var clb = max(clt), clbmsk = (1 << clb) - 1;
                    // code lengths map
                    var clm = hMap(clt, clb, 1);
                    for (var i = 0; i < tl;) {
                        var r = clm[bits(dat, pos, clbmsk)];
                        // bits read
                        pos += r & 15;
                        // symbol
                        var s = r >>> 4;
                        // code length to copy
                        if (s < 16) {
                            ldt[i++] = s;
                        }
                        else {
                            //  copy   count
                            var c = 0, n = 0;
                            if (s == 16)
                                n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                            else if (s == 17)
                                n = 3 + bits(dat, pos, 7), pos += 3;
                            else if (s == 18)
                                n = 11 + bits(dat, pos, 127), pos += 7;
                            while (n--)
                                ldt[i++] = c;
                        }
                    }
                    //    length tree                 distance tree
                    var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                    // max length bits
                    lbt = max(lt);
                    // max dist bits
                    dbt = max(dt);
                    lm = hMap(lt, lbt, 1);
                    dm = hMap(dt, dbt, 1);
                }
                else
                    err(1);
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
            }
            // Make sure the buffer can hold this + the largest possible addition
            // Maximum chunk size (practically, theoretically infinite) is 2^17;
            if (noBuf)
                cbuf(bt + 131072);
            var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
            var lpos = pos;
            for (;; lpos = pos) {
                // bits read, code
                var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
                pos += c & 15;
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (!c)
                    err(2);
                if (sym < 256)
                    buf[bt++] = sym;
                else if (sym == 256) {
                    lpos = pos, lm = null;
                    break;
                }
                else {
                    var add = sym - 254;
                    // no extra bits needed if less
                    if (sym > 264) {
                        // index
                        var i = sym - 257, b = fleb[i];
                        add = bits(dat, pos, (1 << b) - 1) + fl[i];
                        pos += b;
                    }
                    // dist
                    var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                    if (!d)
                        err(3);
                    pos += d & 15;
                    var dt = fd[dsym];
                    if (dsym > 3) {
                        var b = fdeb[dsym];
                        dt += bits16(dat, pos) & ((1 << b) - 1), pos += b;
                    }
                    if (pos > tbts) {
                        if (noSt)
                            err(0);
                        break;
                    }
                    if (noBuf)
                        cbuf(bt + 131072);
                    var end = bt + add;
                    for (; bt < end; bt += 4) {
                        buf[bt] = buf[bt - dt];
                        buf[bt + 1] = buf[bt + 1 - dt];
                        buf[bt + 2] = buf[bt + 2 - dt];
                        buf[bt + 3] = buf[bt + 3 - dt];
                    }
                    bt = end;
                }
            }
            st.l = lm, st.p = lpos, st.b = bt, st.f = final;
            if (lm)
                final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        return bt == buf.length ? buf : slc(buf, 0, bt);
    };
    // empty
    var et = /*#__PURE__*/ new u8(0);
    /**
     * Expands DEFLATE data with no wrapper
     * @param data The data to decompress
     * @param out Where to write the data. Saves memory if you know the decompressed size and provide an output buffer of that length.
     * @returns The decompressed version of the data
     */
    function inflateSync(data, out) {
        return inflt(data, out);
    }
    // text decoder
    var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
    // text decoder stream
    var tds = 0;
    try {
        td.decode(et, { stream: true });
        tds = 1;
    }
    catch (e) { }

    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const base64Lookup = new Uint8Array(256);
    for (let i = 0; i < base64Chars.length; i++) {
        base64Lookup[base64Chars.charCodeAt(i)] = i;
    }
    function getDecodeBase64Length(data) {
        let bufferLength = Math.floor(data.length * 0.75);
        const len = data.length;
        if (data[len - 1] === '=') {
            bufferLength -= 1;
            if (data[len - 2] === '=') {
                bufferLength -= 1;
            }
        }
        return bufferLength;
    }
    function decodeBase64(data) {
        const bufferLength = getDecodeBase64Length(data);
        const len = data.length;
        const bytes = new Uint8Array(bufferLength);
        let p = 0;
        for (let i = 0; i < len; i += 4) {
            const encoded1 = base64Lookup[data.charCodeAt(i)];
            const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
            const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
            const encoded4 = base64Lookup[data.charCodeAt(i + 3)];
            bytes[p] = (encoded1 << 2) | (encoded2 >> 4);
            p += 1;
            bytes[p] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            p += 1;
            bytes[p] = ((encoded3 & 3) << 6) | (encoded4 & 63);
            p += 1;
        }
        return bytes;
    }

    const gmpWasmLength = 522561;
    const gmpWasm = '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';

    let instance = null;
    let compiledModule = null;
    const decompressAndCompile = () => __awaiter(void 0, void 0, void 0, function* () {
        if (compiledModule)
            return;
        // console.time('decompress');
        const decoded = decodeBase64(gmpWasm);
        const decompressed = new Uint8Array(gmpWasmLength);
        inflateSync(decoded, decompressed);
        // console.timeEnd('decompress');
        // console.time('compile');
        compiledModule = yield WebAssembly.compile(decompressed);
        // console.timeEnd('compile');
    });
    const getBinding = (reset = false) => __awaiter(void 0, void 0, void 0, function* () {
        if (!reset && instance !== null) {
            return instance;
        }
        if (typeof WebAssembly === 'undefined') {
            throw new Error('WebAssembly is not supported in this environment!');
        }
        yield decompressAndCompile();
        const heap = { HEAP8: new Uint8Array(0), memView: new DataView(new ArrayBuffer(0)) };
        const errorHandler = () => {
            throw new Error('Fatal error in gmp-wasm');
        };
        const wasmInstance = yield WebAssembly.instantiate(compiledModule, {
            env: {
                emscripten_notify_memory_growth: () => {
                    heap.HEAP8 = new Uint8Array(wasmInstance.exports.memory.buffer);
                    heap.memView = new DataView(heap.HEAP8.buffer, heap.HEAP8.byteOffset, heap.HEAP8.byteLength);
                },
            },
            wasi_snapshot_preview1: {
                proc_exit: errorHandler,
                fd_write: errorHandler,
                fd_seek: errorHandler,
                fd_close: errorHandler,
            },
        });
        const exports = wasmInstance.exports;
        exports._initialize();
        heap.HEAP8 = new Uint8Array(wasmInstance.exports.memory.buffer);
        heap.memView = new DataView(heap.HEAP8.buffer, heap.HEAP8.byteOffset, heap.HEAP8.byteLength);
        instance = Object.assign({ heap }, exports);
        return instance;
    });

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const PREALLOCATED_STR_SIZE = 4 * 1024;
    function getGMPInterface() {
        return __awaiter(this, void 0, void 0, function* () {
            let gmp = yield getBinding();
            let strBuf = gmp.g_malloc(PREALLOCATED_STR_SIZE);
            let mpfr_exp_t_ptr = gmp.g_malloc(4);
            const getStringPointer = (input) => {
                const data = encoder.encode(input);
                let srcPtr = strBuf;
                if (data.length + 1 > PREALLOCATED_STR_SIZE) {
                    srcPtr = gmp.g_malloc(data.length + 1);
                }
                gmp.heap.HEAP8.set(data, srcPtr);
                gmp.heap.HEAP8[srcPtr + data.length] = 0;
                return srcPtr;
            };
            const getMPFRString = (base, n, x, rnd) => {
                const requiredSize = Math.max(7, n + 2);
                const strPtr = gmp.r_get_str(requiredSize < PREALLOCATED_STR_SIZE ? strBuf : 0, mpfr_exp_t_ptr, base, n, x, rnd);
                const mem = gmp.heap.HEAP8;
                const endPtr = mem.indexOf(0, strPtr);
                let str = decoder.decode(mem.subarray(strPtr, endPtr));
                if (strPtr !== strBuf) {
                    gmp.r_free_str(strPtr);
                }
                if (FLOAT_SPECIAL_VALUE_KEYS.includes(str)) {
                    str = FLOAT_SPECIAL_VALUES[str];
                }
                else {
                    // decimal point needs to be inserted
                    const pointPos = gmp.heap.memView.getInt32(mpfr_exp_t_ptr, true);
                    str = insertDecimalPoint(str, pointPos);
                }
                return str;
            };
            return {
                reset: () => __awaiter(this, void 0, void 0, function* () {
                    gmp = yield getBinding(true);
                    strBuf = gmp.g_malloc(PREALLOCATED_STR_SIZE);
                    mpfr_exp_t_ptr = gmp.g_malloc(4);
                }),
                malloc: (size) => gmp.g_malloc(size),
                malloc_cstr: (str) => {
                    const buf = encoder.encode(str);
                    const ptr = gmp.g_malloc(buf.length + 1);
                    gmp.heap.HEAP8.set(buf, ptr);
                    gmp.heap.HEAP8[ptr + buf.length] = 0;
                    return ptr;
                },
                free: (ptr) => gmp.g_free(ptr),
                get mem() { return gmp.heap.HEAP8; },
                get memView() { return gmp.heap.memView; },
                /**************** Random number routines.  ****************/
                /** Initialize state with a default algorithm. */
                gmp_randinit_default: (state) => { gmp.g_randinit_default(state); },
                /** Initialize state with a linear congruential algorithm X = (aX + c) mod 2^m2exp. */
                gmp_randinit_lc_2exp: (state, a, c, m2exp) => { gmp.g_randinit_lc_2exp(state, a, c, m2exp); },
                /** Initialize state for a linear congruential algorithm as per gmp_randinit_lc_2exp. */
                gmp_randinit_lc_2exp_size: (state, size) => { return gmp.g_randinit_lc_2exp_size(state, size); },
                /** Initialize state for a Mersenne Twister algorithm. */
                gmp_randinit_mt: (state) => { gmp.g_randinit_mt(state); },
                /** Initialize rop with a copy of the algorithm and state from op. */
                gmp_randinit_set: (rop, op) => { gmp.g_randinit_set(rop, op); },
                /** Set an initial seed value into state. */
                gmp_randseed: (state, seed) => { gmp.g_randseed(state, seed); },
                /** Set an initial seed value into state. */
                gmp_randseed_ui: (state, seed) => { gmp.g_randseed_ui(state, seed); },
                /** Free all memory occupied by state. */
                gmp_randclear: (state) => { gmp.g_randclear(state); },
                /** Generate a uniformly distributed random number of n bits, i.e. in the range 0 to 2^n - 1 inclusive. */
                gmp_urandomb_ui: (state, n) => { return gmp.g_urandomb_ui(state, n); },
                /** Generate a uniformly distributed random number in the range 0 to n - 1, inclusive. */
                gmp_urandomm_ui: (state, n) => { return gmp.g_urandomm_ui(state, n); },
                /**************** Formatted output routines.  ****************/
                /**************** Formatted input routines.  ****************/
                /**************** Integer (i.e. Z) routines.  ****************/
                /** Get GMP limb size */
                mp_bits_per_limb: () => gmp.z_limb_size(),
                /** Allocates memory for the mpfr_t C struct and returns pointer */
                mpz_t: () => gmp.z_t(),
                /** Deallocates memory of a mpfr_t C struct */
                mpz_t_free: (ptr) => { gmp.z_t_free(ptr); },
                /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
                mpz_t_frees: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.z_t_free(ptrs[i]);
                    }
                },
                /** Set rop to the absolute value of op. */
                mpz_abs: (rop, op) => { gmp.z_abs(rop, op); },
                /** Set rop to op1 + op2. */
                mpz_add: (rop, op1, op2) => { gmp.z_add(rop, op1, op2); },
                /** Set rop to op1 + op2. */
                mpz_add_ui: (rop, op1, op2) => { gmp.z_add_ui(rop, op1, op2); },
                /** Set rop to rop + op1 * op2. */
                mpz_addmul: (rop, op1, op2) => { gmp.z_addmul(rop, op1, op2); },
                /** Set rop to rop + op1 * op2. */
                mpz_addmul_ui: (rop, op1, op2) => { gmp.z_addmul_ui(rop, op1, op2); },
                /** Set rop to op1 bitwise-and op2. */
                mpz_and: (rop, op1, op2) => { gmp.z_and(rop, op1, op2); },
                /** Compute the binomial coefficient n over k and store the result in rop. */
                mpz_bin_ui: (rop, n, k) => { gmp.z_bin_ui(rop, n, k); },
                /** Compute the binomial coefficient n over k and store the result in rop. */
                mpz_bin_uiui: (rop, n, k) => { gmp.z_bin_uiui(rop, n, k); },
                /** Set the quotient q to ceiling(n / d). */
                mpz_cdiv_q: (q, n, d) => { gmp.z_cdiv_q(q, n, d); },
                /** Set the quotient q to ceiling(n / 2^b). */
                mpz_cdiv_q_2exp: (q, n, b) => { gmp.z_cdiv_q_2exp(q, n, b); },
                /** Set the quotient q to ceiling(n / d), and return the remainder r = | n - q * d |. */
                mpz_cdiv_q_ui: (q, n, d) => gmp.z_cdiv_q_ui(q, n, d),
                /** Set the quotient q to ceiling(n / d), and set the remainder r to n - q * d. */
                mpz_cdiv_qr: (q, r, n, d) => { gmp.z_cdiv_qr(q, r, n, d); },
                /** Set quotient q to ceiling(n / d), set the remainder r to n - q * d, and return | r |. */
                mpz_cdiv_qr_ui: (q, r, n, d) => gmp.z_cdiv_qr_ui(q, r, n, d),
                /** Set the remainder r to n - q * d where q = ceiling(n / d). */
                mpz_cdiv_r: (r, n, d) => { gmp.z_cdiv_r(r, n, d); },
                /** Set the remainder r to n - q * 2^b where q = ceiling(n / 2^b). */
                mpz_cdiv_r_2exp: (r, n, b) => { gmp.z_cdiv_r_2exp(r, n, b); },
                /** Set the remainder r to n - q * d where q = ceiling(n / d), and return | r |. */
                mpz_cdiv_r_ui: (r, n, d) => gmp.z_cdiv_r_ui(r, n, d),
                /** Return the remainder | r | where r = n - q * d, and where q = ceiling(n / d). */
                mpz_cdiv_ui: (n, d) => gmp.z_cdiv_ui(n, d),
                /** Free the space occupied by x. */
                mpz_clear: (x) => { gmp.z_clear(x); },
                /** Free the space occupied by a NULL-terminated list of mpz_t variables. */
                mpz_clears: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.z_clear(ptrs[i]);
                    }
                },
                /** Clear bit bit_index in rop. */
                mpz_clrbit: (rop, bit_index) => { gmp.z_clrbit(rop, bit_index); },
                /** Compare op1 and op2. */
                mpz_cmp: (op1, op2) => gmp.z_cmp(op1, op2),
                /** Compare op1 and op2. */
                mpz_cmp_d: (op1, op2) => gmp.z_cmp_d(op1, op2),
                /** Compare op1 and op2. */
                mpz_cmp_si: (op1, op2) => gmp.z_cmp_si(op1, op2),
                /** Compare op1 and op2. */
                mpz_cmp_ui: (op1, op2) => gmp.z_cmp_ui(op1, op2),
                /** Compare the absolute values of op1 and op2. */
                mpz_cmpabs: (op1, op2) => gmp.z_cmpabs(op1, op2),
                /** Compare the absolute values of op1 and op2. */
                mpz_cmpabs_d: (op1, op2) => gmp.z_cmpabs_d(op1, op2),
                /** Compare the absolute values of op1 and op2. */
                mpz_cmpabs_ui: (op1, op2) => gmp.z_cmpabs_ui(op1, op2),
                /** Set rop to the one’s complement of op. */
                mpz_com: (rop, op) => { gmp.z_com(rop, op); },
                /** Complement bit bitIndex in rop. */
                mpz_combit: (rop, bitIndex) => { gmp.z_combit(rop, bitIndex); },
                /** Return non-zero if n is congruent to c modulo d. */
                mpz_congruent_p: (n, c, d) => gmp.z_congruent_p(n, c, d),
                /** Return non-zero if n is congruent to c modulo 2^b. */
                mpz_congruent_2exp_p: (n, c, b) => gmp.z_congruent_2exp_p(n, c, b),
                /** Return non-zero if n is congruent to c modulo d. */
                mpz_congruent_ui_p: (n, c, d) => gmp.z_congruent_ui_p(n, c, d),
                /** Set q to n / d when it is known in advance that d divides n. */
                mpz_divexact: (q, n, d) => { gmp.z_divexact(q, n, d); },
                /** Set q to n / d when it is known in advance that d divides n. */
                mpz_divexact_ui: (q, n, d) => { gmp.z_divexact_ui(q, n, d); },
                /** Return non-zero if n is exactly divisible by d. */
                mpz_divisible_p: (n, d) => gmp.z_divisible_p(n, d),
                /** Return non-zero if n is exactly divisible by d. */
                mpz_divisible_ui_p: (n, d) => gmp.z_divisible_ui_p(n, d),
                /** Return non-zero if n is exactly divisible by 2^b. */
                mpz_divisible_2exp_p: (n, b) => gmp.z_divisible_2exp_p(n, b),
                /** Determine whether op is even. */
                mpz_even_p: (op) => { gmp.z_even_p(op); },
                /** Fill rop with word data from op. */
                mpz_export: (rop, countp, order, size, endian, nails, op) => gmp.z_export(rop, countp, order, size, endian, nails, op),
                /** Set rop to the factorial n!. */
                mpz_fac_ui: (rop, n) => { gmp.z_fac_ui(rop, n); },
                /** Set rop to the double-factorial n!!. */
                mpz_2fac_ui: (rop, n) => { gmp.z_2fac_ui(rop, n); },
                /** Set rop to the m-multi-factorial n!^(m)n. */
                mpz_mfac_uiui: (rop, n, m) => { gmp.z_mfac_uiui(rop, n, m); },
                /** Set rop to the primorial of n, i.e. the product of all positive prime numbers ≤ n. */
                mpz_primorial_ui: (rop, n) => { gmp.z_primorial_ui(rop, n); },
                /** Set the quotient q to floor(n / d). */
                mpz_fdiv_q: (q, n, d) => { gmp.z_fdiv_q(q, n, d); },
                /** Set the quotient q to floor(n / 2^b). */
                mpz_fdiv_q_2exp: (q, n, b) => { gmp.z_fdiv_q_2exp(q, n, b); },
                /** Set the quotient q to floor(n / d), and return the remainder r = | n - q * d |. */
                mpz_fdiv_q_ui: (q, n, d) => gmp.z_fdiv_q_ui(q, n, d),
                /** Set the quotient q to floor(n / d), and set the remainder r to n - q * d. */
                mpz_fdiv_qr: (q, r, n, d) => { gmp.z_fdiv_qr(q, r, n, d); },
                /** Set quotient q to floor(n / d), set the remainder r to n - q * d, and return | r |. */
                mpz_fdiv_qr_ui: (q, r, n, d) => gmp.z_fdiv_qr_ui(q, r, n, d),
                /** Set the remainder r to n - q * d where q = floor(n / d). */
                mpz_fdiv_r: (r, n, d) => { gmp.z_fdiv_r(r, n, d); },
                /** Set the remainder r to n - q * 2^b where q = floor(n / 2^b). */
                mpz_fdiv_r_2exp: (r, n, b) => { gmp.z_fdiv_r_2exp(r, n, b); },
                /** Set the remainder r to n - q * d where q = floor(n / d), and return | r |. */
                mpz_fdiv_r_ui: (r, n, d) => gmp.z_fdiv_r_ui(r, n, d),
                /** Return the remainder | r | where r = n - q * d, and where q = floor(n / d). */
                mpz_fdiv_ui: (n, d) => gmp.z_fdiv_ui(n, d),
                /** Sets fn to to F[n], the n’th Fibonacci number. */
                mpz_fib_ui: (fn, n) => { gmp.z_fib_ui(fn, n); },
                /** Sets fn to F[n], and fnsub1 to F[n - 1]. */
                mpz_fib2_ui: (fn, fnsub1, n) => { gmp.z_fib2_ui(fn, fnsub1, n); },
                /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
                mpz_fits_sint_p: (op) => gmp.z_fits_sint_p(op),
                /** Return non-zero iff the value of op fits in a signed 32-bit integer. Otherwise, return zero. */
                mpz_fits_slong_p: (op) => gmp.z_fits_slong_p(op),
                /** Return non-zero iff the value of op fits in a signed 16-bit integer. Otherwise, return zero. */
                mpz_fits_sshort_p: (op) => gmp.z_fits_sshort_p(op),
                /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
                mpz_fits_uint_p: (op) => gmp.z_fits_uint_p(op),
                /** Return non-zero iff the value of op fits in an unsigned 32-bit integer. Otherwise, return zero. */
                mpz_fits_ulong_p: (op) => gmp.z_fits_ulong_p(op),
                /** Return non-zero iff the value of op fits in an unsigned 16-bit integer. Otherwise, return zero. */
                mpz_fits_ushort_p: (op) => gmp.z_fits_ushort_p(op),
                /** Set rop to the greatest common divisor of op1 and op2. */
                mpz_gcd: (rop, op1, op2) => { gmp.z_gcd(rop, op1, op2); },
                /** Compute the greatest common divisor of op1 and op2. If rop is not null, store the result there. */
                mpz_gcd_ui: (rop, op1, op2) => gmp.z_gcd_ui(rop, op1, op2),
                /** Set g to the greatest common divisor of a and b, and in addition set s and t to coefficients satisfying a * s + b * t = g. */
                mpz_gcdext: (g, s, t, a, b) => { gmp.z_gcdext(g, s, t, a, b); },
                /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
                mpz_get_d: (op) => gmp.z_get_d(op),
                /** Convert op to a double, truncating if necessary (i.e. rounding towards zero), and returning the exponent separately. */
                mpz_get_d_2exp: (exp, op) => gmp.z_get_d_2exp(exp, op),
                /** Return the value of op as an signed long. */
                mpz_get_si: (op) => gmp.z_get_si(op),
                /** Convert op to a string of digits in base base. */
                mpz_get_str: (str, base, op) => gmp.z_get_str(str, base, op),
                /** Return the value of op as an unsigned long. */
                mpz_get_ui: (op) => gmp.z_get_ui(op),
                /** Return limb number n from op. */
                mpz_getlimbn: (op, n) => gmp.z_getlimbn(op, n),
                /** Return the hamming distance between the two operands. */
                mpz_hamdist: (op1, op2) => gmp.z_hamdist(op1, op2),
                /** Set rop from an array of word data at op. */
                mpz_import: (rop, count, order, size, endian, nails, op) => { gmp.z_import(rop, count, order, size, endian, nails, op); },
                /** Initialize x, and set its value to 0. */
                mpz_init: (x) => { gmp.z_init(x); },
                /** Initialize a NULL-terminated list of mpz_t variables, and set their values to 0. */
                mpz_inits: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.z_init(ptrs[i]);
                    }
                },
                /** Initialize x, with space for n-bit numbers, and set its value to 0. */
                mpz_init2: (x, n) => { gmp.z_init2(x, n); },
                /** Initialize rop with limb space and set the initial numeric value from op. */
                mpz_init_set: (rop, op) => { gmp.z_init_set(rop, op); },
                /** Initialize rop with limb space and set the initial numeric value from op. */
                mpz_init_set_d: (rop, op) => { gmp.z_init_set_d(rop, op); },
                /** Initialize rop with limb space and set the initial numeric value from op. */
                mpz_init_set_si: (rop, op) => { gmp.z_init_set_si(rop, op); },
                /** Initialize rop and set its value like mpz_set_str. */
                mpz_init_set_str: (rop, str, base) => gmp.z_init_set_str(rop, str, base),
                /** Initialize rop with limb space and set the initial numeric value from op. */
                mpz_init_set_ui: (rop, op) => { gmp.z_init_set_ui(rop, op); },
                /** Compute the inverse of op1 modulo op2 and put the result in rop. */
                mpz_invert: (rop, op1, op2) => gmp.z_invert(rop, op1, op2),
                /** Set rop to op1 bitwise inclusive-or op2. */
                mpz_ior: (rop, op1, op2) => { gmp.z_ior(rop, op1, op2); },
                /** Calculate the Jacobi symbol (a/b). */
                mpz_jacobi: (a, b) => gmp.z_jacobi(a, b),
                /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
                mpz_kronecker: (a, b) => gmp.z_kronecker(a, b),
                /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
                mpz_kronecker_si: (a, b) => gmp.z_kronecker_si(a, b),
                /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
                mpz_kronecker_ui: (a, b) => gmp.z_kronecker_ui(a, b),
                /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
                mpz_si_kronecker: (a, b) => gmp.z_si_kronecker(a, b),
                /** Calculate the Jacobi symbol (a/b) with the Kronecker extension (a/2) = (2/a) when a odd, or (a/2) = 0 when a even. */
                mpz_ui_kronecker: (a, b) => gmp.z_ui_kronecker(a, b),
                /** Set rop to the least common multiple of op1 and op2. */
                mpz_lcm: (rop, op1, op2) => { gmp.z_lcm(rop, op1, op2); },
                /** Set rop to the least common multiple of op1 and op2. */
                mpz_lcm_ui: (rop, op1, op2) => { gmp.z_lcm_ui(rop, op1, op2); },
                /** Calculate the Legendre symbol (a/p). */
                mpz_legendre: (a, p) => gmp.z_legendre(a, p),
                /** Sets ln to to L[n], the n’th Lucas number. */
                mpz_lucnum_ui: (ln, n) => { gmp.z_lucnum_ui(ln, n); },
                /** Sets ln to L[n], and lnsub1 to L[n - 1]. */
                mpz_lucnum2_ui: (ln, lnsub1, n) => { gmp.z_lucnum2_ui(ln, lnsub1, n); },
                /** An implementation of the probabilistic primality test found in Knuth's Seminumerical Algorithms book. */
                mpz_millerrabin: (n, reps) => gmp.z_millerrabin(n, reps),
                /** Set r to n mod d. */
                mpz_mod: (r, n, d) => { gmp.z_mod(r, n, d); },
                /** Set r to n mod d. */
                mpz_mod_ui: (r, n, d) => { gmp.z_mod_ui(r, n, d); },
                /** Set rop to op1 * op2. */
                mpz_mul: (rop, op1, op2) => { gmp.z_mul(rop, op1, op2); },
                /** Set rop to op1 * 2^op2. */
                mpz_mul_2exp: (rop, op1, op2) => { gmp.z_mul_2exp(rop, op1, op2); },
                /** Set rop to op1 * op2. */
                mpz_mul_si: (rop, op1, op2) => { gmp.z_mul_si(rop, op1, op2); },
                /** Set rop to op1 * op2. */
                mpz_mul_ui: (rop, op1, op2) => { gmp.z_mul_ui(rop, op1, op2); },
                /** Set rop to -op. */
                mpz_neg: (rop, op) => { gmp.z_neg(rop, op); },
                /** Set rop to the next prime greater than op. */
                mpz_nextprime: (rop, op) => { gmp.z_nextprime(rop, op); },
                /** Determine whether op is odd. */
                mpz_odd_p: (op) => { gmp.z_odd_p(op); },
                /** Return non-zero if op is a perfect power, i.e., if there exist integers a and b, with b > 1, such that op = a^b. */
                mpz_perfect_power_p: (op) => gmp.z_perfect_power_p(op),
                /** Return non-zero if op is a perfect square, i.e., if the square root of op is an integer. */
                mpz_perfect_square_p: (op) => gmp.z_perfect_square_p(op),
                /** Return the population count of op. */
                mpz_popcount: (op) => gmp.z_popcount(op),
                /** Set rop to base^exp. The case 0^0 yields 1. */
                mpz_pow_ui: (rop, base, exp) => { gmp.z_pow_ui(rop, base, exp); },
                /** Set rop to (base^exp) modulo mod. */
                mpz_powm: (rop, base, exp, mod) => { gmp.z_powm(rop, base, exp, mod); },
                /** Set rop to (base^exp) modulo mod. */
                mpz_powm_sec: (rop, base, exp, mod) => { gmp.z_powm_sec(rop, base, exp, mod); },
                /** Set rop to (base^exp) modulo mod. */
                mpz_powm_ui: (rop, base, exp, mod) => { gmp.z_powm_ui(rop, base, exp, mod); },
                /** Determine whether n is prime. */
                mpz_probab_prime_p: (n, reps) => gmp.z_probab_prime_p(n, reps),
                /** Generate a random integer of at most maxSize limbs. */
                mpz_random: (rop, maxSize) => { gmp.z_random(rop, maxSize); },
                /** Generate a random integer of at most maxSize limbs, with long strings of zeros and ones in the binary representation. */
                mpz_random2: (rop, maxSize) => { gmp.z_random2(rop, maxSize); },
                /** Change the space allocated for x to n bits. */
                mpz_realloc2: (x, n) => { gmp.z_realloc2(x, n); },
                /** Remove all occurrences of the factor f from op and store the result in rop. */
                mpz_remove: (rop, op, f) => gmp.z_remove(rop, op, f),
                /** Set rop to the truncated integer part of the nth root of op. */
                mpz_root: (rop, op, n) => gmp.z_root(rop, op, n),
                /** Set root to the truncated integer part of the nth root of u. Set rem to the remainder, u - root^n. */
                mpz_rootrem: (root, rem, u, n) => { gmp.z_rootrem(root, rem, u, n); },
                /** Generate a random integer with long strings of zeros and ones in the binary representation. */
                mpz_rrandomb: (rop, state, n) => { gmp.z_rrandomb(rop, state, n); },
                /** Scan op for 0 bit. */
                mpz_scan0: (op, startingBit) => gmp.z_scan0(op, startingBit),
                /** Scan op for 1 bit. */
                mpz_scan1: (op, startingBit) => gmp.z_scan1(op, startingBit),
                /** Set the value of rop from op. */
                mpz_set: (rop, op) => { gmp.z_set(rop, op); },
                /** Set the value of rop from op. */
                mpz_set_d: (rop, op) => { gmp.z_set_d(rop, op); },
                /** Set the value of rop from op. */
                mpz_set_q: (rop, op) => { gmp.z_set_q(rop, op); },
                /** Set the value of rop from op. */
                mpz_set_si: (rop, op) => { gmp.z_set_si(rop, op); },
                /** Set the value of rop from str, a null-terminated C string in base base. */
                mpz_set_str: (rop, str, base) => gmp.z_set_str(rop, str, base),
                /** Set the value of rop from op. */
                mpz_set_ui: (rop, op) => { gmp.z_set_ui(rop, op); },
                /** Set bit bitIndex in rop. */
                mpz_setbit: (rop, bitIndex) => { gmp.z_setbit(rop, bitIndex); },
                /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
                mpz_sgn: (op) => gmp.z_sgn(op),
                /** Return the size of op measured in number of limbs. */
                mpz_size: (op) => gmp.z_size(op),
                /** Return the size of op measured in number of digits in the given base. */
                mpz_sizeinbase: (op, base) => gmp.z_sizeinbase(op, base),
                /** Set rop to the truncated integer part of the square root of op. */
                mpz_sqrt: (rop, op) => { gmp.z_sqrt(rop, op); },
                /** Set rop1 to the truncated integer part of the square root of op, like mpz_sqrt. Set rop2 to the remainder op - rop1 * rop1, which will be zero if op is a perfect square. */
                mpz_sqrtrem: (rop1, rop2, op) => { gmp.z_sqrtrem(rop1, rop2, op); },
                /** Set rop to op1 - op2. */
                mpz_sub: (rop, op1, op2) => { gmp.z_sub(rop, op1, op2); },
                /** Set rop to op1 - op2. */
                mpz_sub_ui: (rop, op1, op2) => { gmp.z_sub_ui(rop, op1, op2); },
                /** Set rop to op1 - op2. */
                mpz_ui_sub: (rop, op1, op2) => { gmp.z_ui_sub(rop, op1, op2); },
                /** Set rop to rop - op1 * op2. */
                mpz_submul: (rop, op1, op2) => { gmp.z_submul(rop, op1, op2); },
                /** Set rop to rop - op1 * op2. */
                mpz_submul_ui: (rop, op1, op2) => { gmp.z_submul_ui(rop, op1, op2); },
                /** Swap the values rop1 and rop2 efficiently. */
                mpz_swap: (rop1, rop2) => { gmp.z_swap(rop1, rop2); },
                /** Return the remainder | r | where r = n - q * d, and where q = trunc(n / d). */
                mpz_tdiv_ui: (n, d) => gmp.z_tdiv_ui(n, d),
                /** Set the quotient q to trunc(n / d). */
                mpz_tdiv_q: (q, n, d) => { gmp.z_tdiv_q(q, n, d); },
                /** Set the quotient q to trunc(n / 2^b). */
                mpz_tdiv_q_2exp: (q, n, b) => { gmp.z_tdiv_q_2exp(q, n, b); },
                /** Set the quotient q to trunc(n / d), and return the remainder r = | n - q * d |. */
                mpz_tdiv_q_ui: (q, n, d) => gmp.z_tdiv_q_ui(q, n, d),
                /** Set the quotient q to trunc(n / d), and set the remainder r to n - q * d. */
                mpz_tdiv_qr: (q, r, n, d) => { gmp.z_tdiv_qr(q, r, n, d); },
                /** Set quotient q to trunc(n / d), set the remainder r to n - q * d, and return | r |. */
                mpz_tdiv_qr_ui: (q, r, n, d) => { return gmp.z_tdiv_qr_ui(q, r, n, d); },
                /** Set the remainder r to n - q * d where q = trunc(n / d). */
                mpz_tdiv_r: (r, n, d) => { gmp.z_tdiv_r(r, n, d); },
                /** Set the remainder r to n - q * 2^b where q = trunc(n / 2^b). */
                mpz_tdiv_r_2exp: (r, n, b) => { gmp.z_tdiv_r_2exp(r, n, b); },
                /** Set the remainder r to n - q * d where q = trunc(n / d), and return | r |. */
                mpz_tdiv_r_ui: (r, n, d) => gmp.z_tdiv_r_ui(r, n, d),
                /** Test bit bitIndex in op and return 0 or 1 accordingly. */
                mpz_tstbit: (op, bitIndex) => gmp.z_tstbit(op, bitIndex),
                /** Set rop to base^exp. The case 0^0 yields 1. */
                mpz_ui_pow_ui: (rop, base, exp) => { gmp.z_ui_pow_ui(rop, base, exp); },
                /** Generate a uniformly distributed random integer in the range 0 to 2^n - 1, inclusive. */
                mpz_urandomb: (rop, state, n) => { gmp.z_urandomb(rop, state, n); },
                /** Generate a uniform random integer in the range 0 to n - 1, inclusive. */
                mpz_urandomm: (rop, state, n) => { gmp.z_urandomm(rop, state, n); },
                /** Set rop to op1 bitwise exclusive-or op2. */
                mpz_xor: (rop, op1, op2) => { gmp.z_xor(rop, op1, op2); },
                /** Return a pointer to the limb array representing the absolute value of x. */
                mpz_limbs_read: (x) => gmp.z_limbs_read(x),
                /** Return a pointer to the limb array of x, intended for write access. */
                mpz_limbs_write: (x, n) => gmp.z_limbs_write(x, n),
                /** Return a pointer to the limb array of x, intended for write access. */
                mpz_limbs_modify: (x, n) => gmp.z_limbs_modify(x, n),
                /** Updates the internal size field of x. */
                mpz_limbs_finish: (x, s) => { gmp.z_limbs_finish(x, s); },
                /** Special initialization of x, using the given limb array and size. */
                mpz_roinit_n: (x, xp, xs) => gmp.z_roinit_n(x, xp, xs),
                /**************** Rational (i.e. Q) routines.  ****************/
                /** Allocates memory for the mpq_t C struct and returns pointer */
                mpq_t: () => gmp.q_t(),
                /** Deallocates memory of a mpq_t C struct */
                mpq_t_free: (mpq_ptr) => { gmp.q_t_free(mpq_ptr); },
                /** Deallocates memory of a NULL-terminated list of mpq_t variables */
                mpq_t_frees: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.q_t_free(ptrs[i]);
                    }
                },
                /** Set rop to the absolute value of op. */
                mpq_abs: (rop, op) => { gmp.q_abs(rop, op); },
                /** Set sum to addend1 + addend2. */
                mpq_add: (sum, addend1, addend2) => { gmp.q_add(sum, addend1, addend2); },
                /** Remove any factors that are common to the numerator and denominator of op, and make the denominator positive. */
                mpq_canonicalize: (op) => { gmp.q_canonicalize(op); },
                /** Free the space occupied by x. */
                mpq_clear: (x) => { gmp.q_clear(x); },
                /** Free the space occupied by a NULL-terminated list of mpq_t variables. */
                mpq_clears: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.q_clear(ptrs[i]);
                    }
                },
                /** Compare op1 and op2. */
                mpq_cmp: (op1, op2) => gmp.q_cmp(op1, op2),
                /** Compare op1 and num2 / den2. */
                mpq_cmp_si: (op1, num2, den2) => gmp.q_cmp_si(op1, num2, den2),
                /** Compare op1 and num2 / den2. */
                mpq_cmp_ui: (op1, num2, den2) => gmp.q_cmp_ui(op1, num2, den2),
                /** Compare op1 and op2. */
                mpq_cmp_z: (op1, op2) => gmp.q_cmp_z(op1, op2),
                /** Set quotient to dividend / divisor. */
                mpq_div: (quotient, dividend, divisor) => { gmp.q_div(quotient, dividend, divisor); },
                /** Set rop to op1 / 2^op2. */
                mpq_div_2exp: (rop, op1, op2) => { gmp.q_div_2exp(rop, op1, op2); },
                /** Return non-zero if op1 and op2 are equal, zero if they are non-equal. */
                mpq_equal: (op1, op2) => gmp.q_equal(op1, op2),
                /** Set numerator to the numerator of rational. */
                mpq_get_num: (numerator, rational) => { gmp.q_get_num(numerator, rational); },
                /** Set denominator to the denominator of rational. */
                mpq_get_den: (denominator, rational) => { gmp.q_get_den(denominator, rational); },
                /** Convert op to a double, truncating if necessary (i.e. rounding towards zero). */
                mpq_get_d: (op) => gmp.q_get_d(op),
                /** Convert op to a string of digits in base base. */
                mpq_get_str: (str, base, op) => gmp.q_get_str(str, base, op),
                /** Initialize x and set it to 0/1. */
                mpq_init: (x) => { gmp.q_init(x); },
                /** Initialize a NULL-terminated list of mpq_t variables, and set their values to 0/1. */
                mpq_inits: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.q_init(ptrs[i]);
                    }
                },
                /** Set inverted_number to 1 / number. */
                mpq_inv: (inverted_number, number) => { gmp.q_inv(inverted_number, number); },
                /** Set product to multiplier * multiplicand. */
                mpq_mul: (product, multiplier, multiplicand) => { gmp.q_mul(product, multiplier, multiplicand); },
                /** Set rop to op1 * 2*op2. */
                mpq_mul_2exp: (rop, op1, op2) => { gmp.q_mul_2exp(rop, op1, op2); },
                /** Set negated_operand to -operand. */
                mpq_neg: (negated_operand, operand) => { gmp.q_neg(negated_operand, operand); },
                /** Assign rop from op. */
                mpq_set: (rop, op) => { gmp.q_set(rop, op); },
                /** Set rop to the value of op. There is no rounding, this conversion is exact. */
                mpq_set_d: (rop, op) => { gmp.q_set_d(rop, op); },
                /** Set the denominator of rational to denominator. */
                mpq_set_den: (rational, denominator) => { gmp.q_set_den(rational, denominator); },
                /** Set the numerator of rational to numerator. */
                mpq_set_num: (rational, numerator) => { gmp.q_set_num(rational, numerator); },
                /** Set the value of rop to op1 / op2. */
                mpq_set_si: (rop, op1, op2) => { gmp.q_set_si(rop, op1, op2); },
                /** Set rop from a null-terminated string str in the given base. */
                mpq_set_str: (rop, str, base) => gmp.q_set_str(rop, str, base),
                /** Set the value of rop to op1 / op2. */
                mpq_set_ui: (rop, op1, op2) => { gmp.q_set_ui(rop, op1, op2); },
                /** Assign rop from op. */
                mpq_set_z: (rop, op) => { gmp.q_set_z(rop, op); },
                /** Return +1 if op > 0, 0 if op = 0, and -1 if op < 0. */
                mpq_sgn: (op) => gmp.q_sgn(op),
                /** Set difference to minuend - subtrahend. */
                mpq_sub: (difference, minuend, subtrahend) => { gmp.q_sub(difference, minuend, subtrahend); },
                /** Swap the values rop1 and rop2 efficiently. */
                mpq_swap: (rop1, rop2) => { gmp.q_swap(rop1, rop2); },
                /** Return a reference to the numerator of op. */
                mpq_numref: (op) => gmp.q_numref(op),
                /** Return a reference to the denominator of op. */
                mpq_denref: (op) => gmp.q_denref(op),
                /**************** MPFR  ****************/
                /** Allocates memory for the mpfr_t C struct and returns pointer */
                mpfr_t: () => gmp.r_t(),
                /** Deallocates memory of a mpfr_t C struct */
                mpfr_t_free: (mpfr_ptr) => { gmp.r_t_free(mpfr_ptr); },
                /** Deallocates memory of a NULL-terminated list of mpfr_t variables */
                mpfr_t_frees: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.r_t_free(ptrs[i]);
                    }
                },
                /** Return the MPFR version, as a null-terminated string. */
                mpfr_get_version: () => gmp.r_get_version(),
                /** Return a null-terminated string containing the ids of the patches applied to the MPFR library (contents of the PATCHES file), separated by spaces. */
                // mpfr_get_patches: (): c_str_ptr => gmp.r_get_patches(),
                /** Return a non-zero value if MPFR was compiled as thread safe using compiler-level Thread Local Storage, return zero otherwise. */
                // mpfr_buildopt_tls_p: (): c_int => gmp.r_buildopt_tls_p(),
                /** Return a non-zero value if MPFR was compiled with ‘__float128’ support, return zero otherwise. */
                // mpfr_buildopt_float128_p: (): c_int => gmp.r_buildopt_float128_p(),
                /** Return a non-zero value if MPFR was compiled with decimal float support, return zero otherwise. */
                // mpfr_buildopt_decimal_p: (): c_int => gmp.r_buildopt_decimal_p(),
                /** Return a non-zero value if MPFR was compiled with GMP internals, return zero otherwise. */
                // mpfr_buildopt_gmpinternals_p: (): c_int => gmp.r_buildopt_gmpinternals_p(),
                /** Return a non-zero value if MPFR was compiled so that all threads share the same cache for one MPFR constant, return zero otherwise. */
                // mpfr_buildopt_sharedcache_p: (): c_int => gmp.r_buildopt_sharedcache_p(),
                /** Return a string saying which thresholds file has been used at compile time. */
                // mpfr_buildopt_tune_case: (): c_str_ptr => gmp.r_buildopt_tune_case(),
                /** Return the (current) smallest exponent allowed for a floating-point variable. */
                mpfr_get_emin: () => gmp.r_get_emin(),
                /** Set the smallest exponent allowed for a floating-point variable. */
                mpfr_set_emin: (exp) => gmp.r_set_emin(exp),
                /** Return the minimum exponent allowed for mpfr_set_emin. */
                mpfr_get_emin_min: () => gmp.r_get_emin_min(),
                /** Return the maximum exponent allowed for mpfr_set_emin. */
                mpfr_get_emin_max: () => gmp.r_get_emin_max(),
                /** Return the (current) largest exponent allowed for a floating-point variable. */
                mpfr_get_emax: () => gmp.r_get_emax(),
                /** Set the largest exponent allowed for a floating-point variable. */
                mpfr_set_emax: (exp) => gmp.r_set_emax(exp),
                /** Return the minimum exponent allowed for mpfr_set_emax. */
                mpfr_get_emax_min: () => gmp.r_get_emax_min(),
                /** Return the maximum exponent allowed for mpfr_set_emax. */
                mpfr_get_emax_max: () => gmp.r_get_emax_max(),
                /** Set the default rounding mode to rnd. */
                mpfr_set_default_rounding_mode: (rnd) => { gmp.r_set_default_rounding_mode(rnd); },
                /** Get the default rounding mode. */
                mpfr_get_default_rounding_mode: () => gmp.r_get_default_rounding_mode(),
                /** Return a string ("MPFR_RNDD", "MPFR_RNDU", "MPFR_RNDN", "MPFR_RNDZ", "MPFR_RNDA") corresponding to the rounding mode rnd, or a null pointer if rnd is an invalid rounding mode. */
                // mpfr_print_rnd_mode: (rnd: mpfr_rnd_t): c_str_ptr => gmp.r_print_rnd_mode(rnd),
                /** Clear (lower) all global flags (underflow, overflow, divide-by-zero, invalid, inexact, erange). */
                mpfr_clear_flags: () => { gmp.r_clear_flags(); },
                /** Clear (lower) the underflow flag. */
                mpfr_clear_underflow: () => { gmp.r_clear_underflow(); },
                /** Clear (lower) the overflow flag. */
                mpfr_clear_overflow: () => { gmp.r_clear_overflow(); },
                /** Clear (lower) the divide-by-zero flag. */
                mpfr_clear_divby0: () => { gmp.r_clear_divby0(); },
                /** Clear (lower) the invalid flag. */
                mpfr_clear_nanflag: () => { gmp.r_clear_nanflag(); },
                /** Clear (lower) the inexact flag. */
                mpfr_clear_inexflag: () => { gmp.r_clear_inexflag(); },
                /** Clear (lower) the erange flag. */
                mpfr_clear_erangeflag: () => { gmp.r_clear_erangeflag(); },
                /** Set (raised) the underflow flag. */
                mpfr_set_underflow: () => { gmp.r_set_underflow(); },
                /** Set (raised) the overflow flag. */
                mpfr_set_overflow: () => { gmp.r_set_overflow(); },
                /** Set (raised) the divide-by-zero flag. */
                mpfr_set_divby0: () => { gmp.r_set_divby0(); },
                /** Set (raised) the invalid flag. */
                mpfr_set_nanflag: () => { gmp.r_set_nanflag(); },
                /** Set (raised) the inexact flag. */
                mpfr_set_inexflag: () => { gmp.r_set_inexflag(); },
                /** Set (raised) the erange flag. */
                mpfr_set_erangeflag: () => { gmp.r_set_erangeflag(); },
                /** Return the underflow flag, which is non-zero iff the flag is set. */
                mpfr_underflow_p: () => gmp.r_underflow_p(),
                /** Return the overflow flag, which is non-zero iff the flag is set. */
                mpfr_overflow_p: () => gmp.r_overflow_p(),
                /** Return the divide-by-zero flag, which is non-zero iff the flag is set. */
                mpfr_divby0_p: () => gmp.r_divby0_p(),
                /** Return the invalid flag, which is non-zero iff the flag is set. */
                mpfr_nanflag_p: () => gmp.r_nanflag_p(),
                /** Return the inexact flag, which is non-zero iff the flag is set. */
                mpfr_inexflag_p: () => gmp.r_inexflag_p(),
                /** Return the erange flag, which is non-zero iff the flag is set. */
                mpfr_erangeflag_p: () => gmp.r_erangeflag_p(),
                /** Clear (lower) the group of flags specified by mask. */
                mpfr_flags_clear: (mask) => { gmp.r_flags_clear(mask); },
                /** Set (raise) the group of flags specified by mask. */
                mpfr_flags_set: (mask) => { gmp.r_flags_set(mask); },
                /** Return the flags specified by mask. */
                mpfr_flags_test: (mask) => gmp.r_flags_test(mask),
                /** Return all the flags. */
                mpfr_flags_save: () => gmp.r_flags_save(),
                /** Restore the flags specified by mask to their state represented in flags. */
                mpfr_flags_restore: (flags, mask) => { gmp.r_flags_restore(flags, mask); },
                /** Check that x is within the current range of acceptable values. */
                mpfr_check_range: (x, t, rnd) => gmp.r_check_range(x, t, rnd),
                /** Initialize x, set its precision to be exactly prec bits and its value to NaN. */
                mpfr_init2: (x, prec) => { gmp.r_init2(x, prec); },
                /** Initialize all the mpfr_t variables of the given variable argument x, set their precision to be exactly prec bits and their value to NaN. */
                mpfr_inits2: (prec, ...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.r_init2(ptrs[i], prec);
                    }
                },
                /** Initialize x, set its precision to the default precision, and set its value to NaN. */
                mpfr_init: (x) => { gmp.r_init(x); },
                /** Initialize all the mpfr_t variables of the given list x, set their precision to the default precision and their value to NaN. */
                mpfr_inits: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.r_init(ptrs[i]);
                    }
                },
                /** Free the space occupied by the significand of x. */
                mpfr_clear: (x) => { gmp.r_clear(x); },
                /** Free the space occupied by all the mpfr_t variables of the given list x. */
                mpfr_clears: (...ptrs) => {
                    for (let i = 0; i < ptrs.length; i++) {
                        if (!ptrs[i])
                            return;
                        gmp.r_clear(ptrs[i]);
                    }
                },
                /** Round x according to rnd with precision prec, which must be an integer between MPFR_PREC_MIN and MPFR_PREC_MAX (otherwise the behavior is undefined). */
                mpfr_prec_round: (x, prec, rnd) => gmp.r_prec_round(x, prec, rnd),
                /** Return non-zero value if one is able to round correctly x to precision prec with the direction rnd2, and 0 otherwise. */
                mpfr_can_round: (b, err, rnd1, rnd2, prec) => gmp.r_can_round(b, err, rnd1, rnd2, prec),
                /** Return the minimal number of bits required to store the significand of x, and 0 for special values, including 0. */
                mpfr_min_prec: (x) => gmp.r_min_prec(x),
                /** Return the exponent of x, assuming that x is a non-zero ordinary number and the significand is considered in [1/2,1). */
                mpfr_get_exp: (x) => gmp.r_get_exp(x),
                /** Set the exponent of x if e is in the current exponent range. */
                mpfr_set_exp: (x, e) => gmp.r_set_exp(x, e),
                /** Return the precision of x, i.e., the number of bits used to store its significand. */
                mpfr_get_prec: (x) => gmp.r_get_prec(x),
                /** Reset the precision of x to be exactly prec bits, and set its value to NaN. */
                mpfr_set_prec: (x, prec) => { gmp.r_set_prec(x, prec); },
                /** Reset the precision of x to be exactly prec bits. */
                mpfr_set_prec_raw: (x, prec) => { gmp.r_set_prec_raw(x, prec); },
                /** Set the default precision to be exactly prec bits, where prec can be any integer between MPFR_PREC_MINand MPFR_PREC_MAX. */
                mpfr_set_default_prec: (prec) => { gmp.r_set_default_prec(prec); },
                /** Return the current default MPFR precision in bits. */
                mpfr_get_default_prec: () => gmp.r_get_default_prec(),
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set_d: (rop, op, rnd) => gmp.r_set_d(rop, op, rnd),
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set_z: (rop, op, rnd) => gmp.r_set_z(rop, op, rnd),
                /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
                mpfr_set_z_2exp: (rop, op, e, rnd) => gmp.r_set_z_2exp(rop, op, e, rnd),
                /** Set the variable x to NaN (Not-a-Number). */
                mpfr_set_nan: (x) => { gmp.r_set_nan(x); },
                /** Set the variable x to infinity. */
                mpfr_set_inf: (x, sign) => { gmp.r_set_inf(x, sign); },
                /** Set the variable x to zero. */
                mpfr_set_zero: (x, sign) => { gmp.r_set_zero(x, sign); },
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set_si: (rop, op, rnd) => gmp.r_set_si(rop, op, rnd),
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set_ui: (rop, op, rnd) => gmp.r_set_ui(rop, op, rnd),
                /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
                mpfr_set_si_2exp: (rop, op, e, rnd) => gmp.r_set_si_2exp(rop, op, e, rnd),
                /** Set the value of rop from op multiplied by two to the power e, rounded toward the given direction rnd. */
                mpfr_set_ui_2exp: (rop, op, e, rnd) => gmp.r_set_ui_2exp(rop, op, e, rnd),
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set_q: (rop, op, rnd) => gmp.r_set_q(rop, op, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul_q: (rop, op1, op2, rnd) => gmp.r_mul_q(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div_q: (rop, op1, op2, rnd) => gmp.r_div_q(rop, op1, op2, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add_q: (rop, op1, op2, rnd) => gmp.r_add_q(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub_q: (rop, op1, op2, rnd) => gmp.r_sub_q(rop, op1, op2, rnd),
                /** Compare op1 and op2. */
                mpfr_cmp_q: (op1, op2) => gmp.r_cmp_q(op1, op2),
                /** Convert op to a mpq_t. */
                mpfr_get_q: (rop, op) => gmp.r_get_q(rop, op),
                /** Set rop to the value of the string s in base base, rounded in the direction rnd. */
                mpfr_set_str: (rop, s, base, rnd) => gmp.r_set_str(rop, s, base, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set: (rop, op, rnd) => gmp.r_init_set(rop, op, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set_ui: (rop, op, rnd) => gmp.r_init_set_ui(rop, op, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set_si: (rop, op, rnd) => gmp.r_init_set_si(rop, op, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set_d: (rop, op, rnd) => gmp.r_init_set_d(rop, op, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set_z: (rop, op, rnd) => gmp.r_init_set_z(rop, op, rnd),
                /** Initialize rop and set its value from op, rounded in the direction rnd. */
                mpfr_init_set_q: (rop, op, rnd) => gmp.r_init_set_q(rop, op, rnd),
                /** Initialize x and set its value from the string s in base base, rounded in the direction rnd. */
                mpfr_init_set_str: (x, s, base, rnd) => gmp.r_init_set_str(x, s, base, rnd),
                /** Set rop to the absolute value of op rounded in the direction rnd. */
                mpfr_abs: (rop, op, rnd) => gmp.r_abs(rop, op, rnd),
                /** Set the value of rop from op rounded toward the given direction rnd. */
                mpfr_set: (rop, op, rnd) => gmp.r_set(rop, op, rnd),
                /** Set rop to -op rounded in the direction rnd. */
                mpfr_neg: (rop, op, rnd) => gmp.r_neg(rop, op, rnd),
                /** Return a non-zero value iff op has its sign bit set (i.e., if it is negative, -0, or a NaN whose representation has its sign bit set). */
                mpfr_signbit: (op) => gmp.r_signbit(op),
                /** Set the value of rop from op, rounded toward the given direction rnd, then set (resp. clear) its sign bit if s is non-zero (resp. zero), even when op is a NaN. */
                mpfr_setsign: (rop, op, s, rnd) => gmp.r_setsign(rop, op, s, rnd),
                /** Set the value of rop from op1, rounded toward the given direction rnd, then set its sign bit to that of op2 (even when op1 or op2 is a NaN). */
                mpfr_copysign: (rop, op1, op2, rnd) => gmp.r_copysign(rop, op1, op2, rnd),
                /** Put the scaled significand of op (regarded as an integer, with the precision of op) into rop, and return the exponent exp (which may be outside the current exponent range) such that op = rop * 2^exp. */
                mpfr_get_z_2exp: (rop, op) => gmp.r_get_z_2exp(rop, op),
                /** Convert op to a double, using the rounding mode rnd. */
                mpfr_get_d: (op, rnd) => gmp.r_get_d(op, rnd),
                /** Return d and set exp such that 0.5 ≤ abs(d) <1 and d * 2^exp = op rounded to double precision, using the given rounding mode. */
                mpfr_get_d_2exp: (exp, op, rnd) => gmp.r_get_d_2exp(exp, op, rnd),
                /** Set exp and y such that 0.5 ≤ abs(y) < 1 and y * 2^exp = x rounded to the precision of y, using the given rounding mode. */
                mpfr_frexp: (exp, y, x, rnd) => gmp.r_frexp(exp, y, x, rnd),
                /** Convert op to a long after rounding it with respect to rnd. */
                mpfr_get_si: (op, rnd) => gmp.r_get_si(op, rnd),
                /** Convert op to an unsigned long after rounding it with respect to rnd. */
                mpfr_get_ui: (op, rnd) => gmp.r_get_ui(op, rnd),
                /** Return the minimal integer m such that any number of p bits, when output with m digits in radix b with rounding to nearest, can be recovered exactly when read again, still with rounding to nearest. More precisely, we have m = 1 + ceil(p*log(2)/log(b)), with p replaced by p-1 if b is a power of 2. */
                mpfr_get_str_ndigits: (b, p) => gmp.r_get_str_ndigits(b, p),
                /** Convert op to a string of digits in base b, with rounding in the direction rnd, where n is either zero (see below) or the number of significant digits output in the string; in the latter case, n must be greater or equal to 2. */
                mpfr_get_str: (str, expptr, base, n, op, rnd) => gmp.r_get_str(str, expptr, base, n, op, rnd),
                /** Convert op to a mpz_t, after rounding it with respect to rnd. */
                mpfr_get_z: (rop, op, rnd) => gmp.r_get_z(rop, op, rnd),
                /** Free a string allocated by mpfr_get_str using the unallocation function (see GNU MPFR - Memory Handling). */
                mpfr_free_str: (str) => { gmp.r_free_str(str); },
                /** Generate a uniformly distributed random float. */
                mpfr_urandom: (rop, state, rnd) => gmp.r_urandom(rop, state, rnd),
                /** Generate one random float according to a standard normal gaussian distribution (with mean zero and variance one). */
                mpfr_nrandom: (rop, state, rnd) => gmp.r_nrandom(rop, state, rnd),
                /** Generate one random float according to an exponential distribution, with mean one. */
                mpfr_erandom: (rop, state, rnd) => gmp.r_erandom(rop, state, rnd),
                /** Generate a uniformly distributed random float in the interval 0 ≤ rop < 1. */
                mpfr_urandomb: (rop, state) => gmp.r_urandomb(rop, state),
                /** Equivalent to mpfr_nexttoward where y is plus infinity. */
                mpfr_nextabove: (x) => { gmp.r_nextabove(x); },
                /** Equivalent to mpfr_nexttoward where y is minus infinity. */
                mpfr_nextbelow: (x) => { gmp.r_nextbelow(x); },
                /** Replace x by the next floating-point number in the direction of y. */
                mpfr_nexttoward: (x, y) => { gmp.r_nexttoward(x, y); },
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_pow: (rop, op1, op2, rnd) => gmp.r_pow(rop, op1, op2, rnd),
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_pow_si: (rop, op1, op2, rnd) => gmp.r_pow_si(rop, op1, op2, rnd),
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_pow_ui: (rop, op1, op2, rnd) => gmp.r_pow_ui(rop, op1, op2, rnd),
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_ui_pow_ui: (rop, op1, op2, rnd) => gmp.r_ui_pow_ui(rop, op1, op2, rnd),
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_ui_pow: (rop, op1, op2, rnd) => gmp.r_ui_pow(rop, op1, op2, rnd),
                /** Set rop to op1 raised to op2, rounded in the direction rnd. */
                mpfr_pow_z: (rop, op1, op2, rnd) => gmp.r_pow_z(rop, op1, op2, rnd),
                /** Set rop to the square root of op rounded in the direction rnd. */
                mpfr_sqrt: (rop, op, rnd) => gmp.r_sqrt(rop, op, rnd),
                /** Set rop to the square root of op rounded in the direction rnd. */
                mpfr_sqrt_ui: (rop, op, rnd) => gmp.r_sqrt_ui(rop, op, rnd),
                /** Set rop to the reciprocal square root of op rounded in the direction rnd. */
                mpfr_rec_sqrt: (rop, op, rnd) => gmp.r_rec_sqrt(rop, op, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add: (rop, op1, op2, rnd) => gmp.r_add(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub: (rop, op1, op2, rnd) => gmp.r_sub(rop, op1, op2, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul: (rop, op1, op2, rnd) => gmp.r_mul(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div: (rop, op1, op2, rnd) => gmp.r_div(rop, op1, op2, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add_ui: (rop, op1, op2, rnd) => gmp.r_add_ui(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub_ui: (rop, op1, op2, rnd) => gmp.r_sub_ui(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_ui_sub: (rop, op1, op2, rnd) => gmp.r_ui_sub(rop, op1, op2, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul_ui: (rop, op1, op2, rnd) => gmp.r_mul_ui(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div_ui: (rop, op1, op2, rnd) => gmp.r_div_ui(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_ui_div: (rop, op1, op2, rnd) => gmp.r_ui_div(rop, op1, op2, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add_si: (rop, op1, op2, rnd) => gmp.r_add_si(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub_si: (rop, op1, op2, rnd) => gmp.r_sub_si(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_si_sub: (rop, op1, op2, rnd) => gmp.r_si_sub(rop, op1, op2, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul_si: (rop, op1, op2, rnd) => gmp.r_mul_si(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div_si: (rop, op1, op2, rnd) => gmp.r_div_si(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_si_div: (rop, op1, op2, rnd) => gmp.r_si_div(rop, op1, op2, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add_d: (rop, op1, op2, rnd) => gmp.r_add_d(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub_d: (rop, op1, op2, rnd) => gmp.r_sub_d(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_d_sub: (rop, op1, op2, rnd) => gmp.r_d_sub(rop, op1, op2, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul_d: (rop, op1, op2, rnd) => gmp.r_mul_d(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div_d: (rop, op1, op2, rnd) => gmp.r_div_d(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_d_div: (rop, op1, op2, rnd) => gmp.r_d_div(rop, op1, op2, rnd),
                /** Set rop to the square of op rounded in the direction rnd. */
                mpfr_sqr: (rop, op, rnd) => gmp.r_sqr(rop, op, rnd),
                /** Set rop to the value of Pi rounded in the direction rnd. */
                mpfr_const_pi: (rop, rnd) => gmp.r_const_pi(rop, rnd),
                /** Set rop to the logarithm of 2 rounded in the direction rnd. */
                mpfr_const_log2: (rop, rnd) => gmp.r_const_log2(rop, rnd),
                /** Set rop to the value of Euler’s constant 0.577… rounded in the direction rnd. */
                mpfr_const_euler: (rop, rnd) => gmp.r_const_euler(rop, rnd),
                /** Set rop to the value of Catalan’s constant 0.915… rounded in the direction rnd. */
                mpfr_const_catalan: (rop, rnd) => gmp.r_const_catalan(rop, rnd),
                /** Set rop to the arithmetic-geometric mean of op1 and op2 rounded in the direction rnd. */
                mpfr_agm: (rop, op1, op2, rnd) => gmp.r_agm(rop, op1, op2, rnd),
                /** Set rop to the natural logarithm of op rounded in the direction rnd. */
                mpfr_log: (rop, op, rnd) => gmp.r_log(rop, op, rnd),
                /** Set rop to log2(op) rounded in the direction rnd. */
                mpfr_log2: (rop, op, rnd) => gmp.r_log2(rop, op, rnd),
                /** Set rop to log10(op) rounded in the direction rnd. */
                mpfr_log10: (rop, op, rnd) => gmp.r_log10(rop, op, rnd),
                /** Set rop to the logarithm of one plus op, rounded in the direction rnd. */
                mpfr_log1p: (rop, op, rnd) => gmp.r_log1p(rop, op, rnd),
                /** Set rop to the natural logarithm of op rounded in the direction rnd. */
                mpfr_log_ui: (rop, op, rnd) => gmp.r_log_ui(rop, op, rnd),
                /** Set rop to the exponential of op rounded in the direction rnd. */
                mpfr_exp: (rop, op, rnd) => gmp.r_exp(rop, op, rnd),
                /** Set rop to 2^op rounded in the direction rnd. */
                mpfr_exp2: (rop, op, rnd) => gmp.r_exp2(rop, op, rnd),
                /** Set rop to 10^op rounded in the direction rnd. */
                mpfr_exp10: (rop, op, rnd) => gmp.r_exp10(rop, op, rnd),
                /** Set rop to the e^op - 1, rounded in the direction rnd. */
                mpfr_expm1: (rop, op, rnd) => gmp.r_expm1(rop, op, rnd),
                /** Set rop to the exponential integral of op rounded in the direction rnd. */
                mpfr_eint: (rop, op, rnd) => gmp.r_eint(rop, op, rnd),
                /** Set rop to real part of the dilogarithm of op rounded in the direction rnd. */
                mpfr_li2: (rop, op, rnd) => gmp.r_li2(rop, op, rnd),
                /** Compare op1 and op2. */
                mpfr_cmp: (op1, op2) => gmp.r_cmp(op1, op2),
                /** Compare op1 and op2. */
                mpfr_cmp_d: (op1, op2) => gmp.r_cmp_d(op1, op2),
                /** Compare op1 and op2. */
                mpfr_cmp_ui: (op1, op2) => gmp.r_cmp_ui(op1, op2),
                /** Compare op1 and op2. */
                mpfr_cmp_si: (op1, op2) => gmp.r_cmp_si(op1, op2),
                /** Compare op1 and op2 * 2^e. */
                mpfr_cmp_ui_2exp: (op1, op2, e) => gmp.r_cmp_ui_2exp(op1, op2, e),
                /** Compare op1 and op2 * 2^e. */
                mpfr_cmp_si_2exp: (op1, op2, e) => gmp.r_cmp_si_2exp(op1, op2, e),
                /** Compare |op1| and |op2|. */
                mpfr_cmpabs: (op1, op2) => gmp.r_cmpabs(op1, op2),
                /** Compare |op1| and |op2|. */
                mpfr_cmpabs_ui: (op1, op2) => gmp.r_cmpabs_ui(op1, op2),
                /** Compute the relative difference between op1 and op2 and store the result in rop. */
                mpfr_reldiff: (rop, op1, op2, rnd) => { gmp.r_reldiff(rop, op1, op2, rnd); },
                /** Return non-zero if op1 and op2 are both non-zero ordinary numbers with the same exponent and the same first op3 bits. */
                mpfr_eq: (op1, op2, op3) => gmp.r_eq(op1, op2, op3),
                /** Return a positive value if op > 0, zero if op = 0, and a negative value if op < 0. */
                mpfr_sgn: (op) => gmp.r_sgn(op),
                /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
                mpfr_mul_2exp: (rop, op1, op2, rnd) => gmp.r_mul_2exp(rop, op1, op2, rnd),
                /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
                mpfr_div_2exp: (rop, op1, op2, rnd) => gmp.r_div_2exp(rop, op1, op2, rnd),
                /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
                mpfr_mul_2ui: (rop, op1, op2, rnd) => gmp.r_mul_2ui(rop, op1, op2, rnd),
                /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
                mpfr_div_2ui: (rop, op1, op2, rnd) => gmp.r_div_2ui(rop, op1, op2, rnd),
                /** Set rop to op1 * 2^op2 rounded in the direction rnd. */
                mpfr_mul_2si: (rop, op1, op2, rnd) => gmp.r_mul_2si(rop, op1, op2, rnd),
                /** Set rop to op1 divided by 2^op2 rounded in the direction rnd. */
                mpfr_div_2si: (rop, op1, op2, rnd) => gmp.r_div_2si(rop, op1, op2, rnd),
                /** Set rop to op rounded to the nearest representable integer in the given direction rnd. */
                mpfr_rint: (rop, op, rnd) => gmp.r_rint(rop, op, rnd),
                /** Set rop to op rounded to the nearest representable integer, rounding halfway cases with the even-rounding rule zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDN). */
                mpfr_roundeven: (rop, op) => gmp.r_roundeven(rop, op),
                /** Set rop to op rounded to the nearest representable integer, rounding halfway cases away from zero (as in the roundTiesToAway mode of IEEE 754-2008). */
                mpfr_round: (rop, op) => gmp.r_round(rop, op),
                /** Set rop to op rounded to the next representable integer toward zero (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDZ). */
                mpfr_trunc: (rop, op) => gmp.r_trunc(rop, op),
                /** Set rop to op rounded to the next higher or equal representable integer (like mpfr_rint(mpfr_t, mpfr_t, mpfr_rnd_t) with MPFR_RNDU). */
                mpfr_ceil: (rop, op) => gmp.r_ceil(rop, op),
                /** Set rop to op rounded to the next lower or equal representable integer. */
                mpfr_floor: (rop, op) => gmp.r_floor(rop, op),
                /** Set rop to op rounded to the nearest integer, rounding halfway cases to the nearest even integer. */
                mpfr_rint_roundeven: (rop, op, rnd) => gmp.r_rint_roundeven(rop, op, rnd),
                /** Set rop to op rounded to the nearest integer, rounding halfway cases away from zero. */
                mpfr_rint_round: (rop, op, rnd) => gmp.r_rint_round(rop, op, rnd),
                /** Set rop to op rounded to the next integer toward zero. */
                mpfr_rint_trunc: (rop, op, rnd) => gmp.r_rint_trunc(rop, op, rnd),
                /** Set rop to op rounded to the next higher or equal integer. */
                mpfr_rint_ceil: (rop, op, rnd) => gmp.r_rint_ceil(rop, op, rnd),
                /** Set rop to op rounded to the next lower or equal integer. */
                mpfr_rint_floor: (rop, op, rnd) => gmp.r_rint_floor(rop, op, rnd),
                /** Set rop to the fractional part of op, having the same sign as op, rounded in the direction rnd. */
                mpfr_frac: (rop, op, rnd) => gmp.r_frac(rop, op, rnd),
                /** Set simultaneously iop to the integral part of op and fop to the fractional part of op, rounded in the direction rnd with the corresponding precision of iop and fop. */
                mpfr_modf: (rop, fop, op, rnd) => gmp.r_modf(rop, fop, op, rnd),
                /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
                mpfr_remquo: (r, q, x, y, rnd) => gmp.r_remquo(r, q, x, y, rnd),
                /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded to the nearest integer (ties rounded to even). */
                mpfr_remainder: (rop, x, y, rnd) => gmp.r_remainder(rop, x, y, rnd),
                /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
                mpfr_fmod: (rop, x, y, rnd) => gmp.r_fmod(rop, x, y, rnd),
                /** Set r to the value of x - n * y, rounded according to the direction rnd, where n is the integer quotient of x divided by y, rounded toward zero. */
                mpfr_fmodquo: (rop, q, x, y, rnd) => gmp.r_fmodquo(rop, q, x, y, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
                mpfr_fits_ulong_p: (op, rnd) => gmp.r_fits_ulong_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
                mpfr_fits_slong_p: (op, rnd) => gmp.r_fits_slong_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) unsigned int when rounded to an integer in the direction rnd. */
                mpfr_fits_uint_p: (op, rnd) => gmp.r_fits_uint_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) int when rounded to an integer in the direction rnd. */
                mpfr_fits_sint_p: (op, rnd) => gmp.r_fits_sint_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (16-bit) unsigned short when rounded to an integer in the direction rnd. */
                mpfr_fits_ushort_p: (op, rnd) => gmp.r_fits_ushort_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (16-bit) short when rounded to an integer in the direction rnd. */
                mpfr_fits_sshort_p: (op, rnd) => gmp.r_fits_sshort_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) unsigned long when rounded to an integer in the direction rnd. */
                mpfr_fits_uintmax_p: (op, rnd) => gmp.r_fits_uintmax_p(op, rnd),
                /** Return non-zero if op would fit in the C data type (32-bit) long when rounded to an integer in the direction rnd. */
                mpfr_fits_intmax_p: (op, rnd) => gmp.r_fits_intmax_p(op, rnd),
                /** Swap the structures pointed to by x and y. */
                mpfr_swap: (x, y) => { gmp.r_swap(x, y); },
                /** Return non-zero if op is NaN. Return zero otherwise. */
                mpfr_nan_p: (op) => gmp.r_nan_p(op),
                /** Return non-zero if op is an infinity. Return zero otherwise. */
                mpfr_inf_p: (op) => gmp.r_inf_p(op),
                /** Return non-zero if op is an ordinary number (i.e., neither NaN nor an infinity). Return zero otherwise. */
                mpfr_number_p: (op) => gmp.r_number_p(op),
                /** Return non-zero iff op is an integer. */
                mpfr_integer_p: (op) => gmp.r_integer_p(op),
                /** Return non-zero if op is zero. Return zero otherwise. */
                mpfr_zero_p: (op) => gmp.r_zero_p(op),
                /** Return non-zero if op is a regular number (i.e., neither NaN, nor an infinity nor zero). Return zero otherwise. */
                mpfr_regular_p: (op) => gmp.r_regular_p(op),
                /** Return non-zero if op1 > op2, and zero otherwise. */
                mpfr_greater_p: (op1, op2) => gmp.r_greater_p(op1, op2),
                /** Return non-zero if op1 ≥ op2, and zero otherwise. */
                mpfr_greaterequal_p: (op1, op2) => gmp.r_greaterequal_p(op1, op2),
                /** Return non-zero if op1 < op2, and zero otherwise. */
                mpfr_less_p: (op1, op2) => gmp.r_less_p(op1, op2),
                /** Return non-zero if op1 ≤ op2, and zero otherwise. */
                mpfr_lessequal_p: (op1, op2) => gmp.r_lessequal_p(op1, op2),
                /** Return non-zero if op1 < op2 or op1 > op2 (i.e., neither op1, nor op2 is NaN, and op1 ≠ op2), zero otherwise (i.e., op1 and/or op2 is NaN, or op1 = op2). */
                mpfr_lessgreater_p: (op1, op2) => gmp.r_lessgreater_p(op1, op2),
                /** Return non-zero if op1 = op2, and zero otherwise. */
                mpfr_equal_p: (op1, op2) => gmp.r_equal_p(op1, op2),
                /** Return non-zero if op1 or op2 is a NaN (i.e., they cannot be compared), zero otherwise. */
                mpfr_unordered_p: (op1, op2) => gmp.r_unordered_p(op1, op2),
                /** Set rop to the inverse hyperbolic tangent of op rounded in the direction rnd. */
                mpfr_atanh: (rop, op, rnd) => gmp.r_atanh(rop, op, rnd),
                /** Set rop to the inverse hyperbolic cosine of op rounded in the direction rnd. */
                mpfr_acosh: (rop, op, rnd) => gmp.r_acosh(rop, op, rnd),
                /** Set rop to the inverse hyperbolic sine of op rounded in the direction rnd. */
                mpfr_asinh: (rop, op, rnd) => gmp.r_asinh(rop, op, rnd),
                /** Set rop to the hyperbolic cosine of op rounded in the direction rnd. */
                mpfr_cosh: (rop, op, rnd) => gmp.r_cosh(rop, op, rnd),
                /** Set rop to the hyperbolic sine of op rounded in the direction rnd. */
                mpfr_sinh: (rop, op, rnd) => gmp.r_sinh(rop, op, rnd),
                /** Set rop to the hyperbolic tangent of op rounded in the direction rnd. */
                mpfr_tanh: (rop, op, rnd) => gmp.r_tanh(rop, op, rnd),
                /** Set simultaneously sop to the hyperbolic sine of op and cop to the hyperbolic cosine of op, rounded in the direction rnd with the corresponding precision of sop and cop, which must be different variables. */
                mpfr_sinh_cosh: (sop, cop, op, rnd) => gmp.r_sinh_cosh(sop, cop, op, rnd),
                /** Set rop to the hyperbolic secant of op rounded in the direction rnd. */
                mpfr_sech: (rop, op, rnd) => gmp.r_sech(rop, op, rnd),
                /** Set rop to the hyperbolic cosecant of op rounded in the direction rnd. */
                mpfr_csch: (rop, op, rnd) => gmp.r_csch(rop, op, rnd),
                /** Set rop to the hyperbolic cotangent of op rounded in the direction rnd. */
                mpfr_coth: (rop, op, rnd) => gmp.r_coth(rop, op, rnd),
                /** Set rop to the arc-cosine of op rounded in the direction rnd. */
                mpfr_acos: (rop, op, rnd) => gmp.r_acos(rop, op, rnd),
                /** Set rop to the arc-sine of op rounded in the direction rnd. */
                mpfr_asin: (rop, op, rnd) => gmp.r_asin(rop, op, rnd),
                /** Set rop to the arc-tangent of op rounded in the direction rnd. */
                mpfr_atan: (rop, op, rnd) => gmp.r_atan(rop, op, rnd),
                /** Set rop to the sine of op rounded in the direction rnd. */
                mpfr_sin: (rop, op, rnd) => gmp.r_sin(rop, op, rnd),
                /** Set simultaneously sop to the sine of op and cop to the cosine of op, rounded in the direction rnd with the corresponding precisions of sop and cop, which must be different variables. */
                mpfr_sin_cos: (sop, cop, op, rnd) => gmp.r_sin_cos(sop, cop, op, rnd),
                /** Set rop to the cosine of op rounded in the direction rnd. */
                mpfr_cos: (rop, op, rnd) => gmp.r_cos(rop, op, rnd),
                /** Set rop to the tangent of op rounded in the direction rnd. */
                mpfr_tan: (rop, op, rnd) => gmp.r_tan(rop, op, rnd),
                /** Set rop to the arc-tangent2 of y and x rounded in the direction rnd. */
                mpfr_atan2: (rop, y, x, rnd) => gmp.r_atan2(rop, y, x, rnd),
                /** Set rop to the secant of op rounded in the direction rnd. */
                mpfr_sec: (rop, op, rnd) => gmp.r_sec(rop, op, rnd),
                /** Set rop to the cosecant of op rounded in the direction rnd. */
                mpfr_csc: (rop, op, rnd) => gmp.r_csc(rop, op, rnd),
                /** Set rop to the cotangent of op rounded in the direction rnd. */
                mpfr_cot: (rop, op, rnd) => gmp.r_cot(rop, op, rnd),
                /** Set rop to the Euclidean norm of x and y, i.e., the square root of the sum of the squares of x and y rounded in the direction rnd. */
                mpfr_hypot: (rop, x, y, rnd) => gmp.r_hypot(rop, x, y, rnd),
                /** Set rop to the value of the error function on op rounded in the direction rnd. */
                mpfr_erf: (rop, op, rnd) => gmp.r_erf(rop, op, rnd),
                /** Set rop to the value of the complementary error function on op rounded in the direction rnd. */
                mpfr_erfc: (rop, op, rnd) => gmp.r_erfc(rop, op, rnd),
                /** Set rop to the cubic root of op rounded in the direction rnd. */
                mpfr_cbrt: (rop, op, rnd) => gmp.r_cbrt(rop, op, rnd),
                /** Set rop to the kth root of op rounded in the direction rnd. */
                mpfr_rootn_ui: (rop, op, k, rnd) => gmp.r_rootn_ui(rop, op, k, rnd),
                /** Set rop to the value of the Gamma function on op rounded in the direction rnd. */
                mpfr_gamma: (rop, op, rnd) => gmp.r_gamma(rop, op, rnd),
                /** Set rop to the value of the incomplete Gamma function on op and op2, rounded in the direction rnd. */
                mpfr_gamma_inc: (rop, op, op2, rnd) => gmp.r_gamma_inc(rop, op, op2, rnd),
                /** Set rop to the value of the Beta function at arguments op1 and op2, rounded in the direction rnd. */
                mpfr_beta: (rop, op1, op2, rnd) => gmp.r_beta(rop, op1, op2, rnd),
                /** Set rop to the value of the logarithm of the Gamma function on op rounded in the direction rnd. */
                mpfr_lngamma: (rop, op, rnd) => gmp.r_lngamma(rop, op, rnd),
                /** Set rop to the value of the logarithm of the absolute value of the Gamma function on op rounded in the direction rnd. */
                mpfr_lgamma: (rop, signp, op, rnd) => gmp.r_lgamma(rop, signp, op, rnd),
                /** Set rop to the value of the Digamma (sometimes also called Psi) function on op rounded in the direction rnd. */
                mpfr_digamma: (rop, op, rnd) => gmp.r_digamma(rop, op, rnd),
                /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
                mpfr_zeta: (rop, op, rnd) => gmp.r_zeta(rop, op, rnd),
                /** Set rop to the value of the Riemann Zeta function on op rounded in the direction rnd. */
                mpfr_zeta_ui: (rop, op, rnd) => gmp.r_zeta_ui(rop, op, rnd),
                /** Set rop to the factorial of op rounded in the direction rnd. */
                mpfr_fac_ui: (rop, op, rnd) => gmp.r_fac_ui(rop, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
                mpfr_j0: (rop, op, rnd) => gmp.r_j0(rop, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
                mpfr_j1: (rop, op, rnd) => gmp.r_j1(rop, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
                mpfr_jn: (rop, n, op, rnd) => gmp.r_jn(rop, n, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order 0 on op rounded in the direction rnd. */
                mpfr_y0: (rop, op, rnd) => gmp.r_y0(rop, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order 1 on op rounded in the direction rnd. */
                mpfr_y1: (rop, op, rnd) => gmp.r_y1(rop, op, rnd),
                /** Set rop to the value of the first kind Bessel function of order n on op rounded in the direction rnd. */
                mpfr_yn: (rop, n, op, rnd) => gmp.r_yn(rop, n, op, rnd),
                /** Set rop to the value of the Airy function Ai on x rounded in the direction rnd. */
                mpfr_ai: (rop, x, rnd) => gmp.r_ai(rop, x, rnd),
                /** Set rop to the minimum of op1 and op2. */
                mpfr_min: (rop, op1, op2, rnd) => gmp.r_min(rop, op1, op2, rnd),
                /** Set rop to the maximum of op1 and op2. */
                mpfr_max: (rop, op1, op2, rnd) => gmp.r_max(rop, op1, op2, rnd),
                /** Set rop to the positive difference of op1 and op2, i.e., op1 - op2 rounded in the direction rnd if op1 > op2, +0 if op1 ≤ op2, and NaN if op1 or op2 is NaN. */
                mpfr_dim: (rop, op1, op2, rnd) => gmp.r_dim(rop, op1, op2, rnd),
                /** Set rop to op1 * op2 rounded in the direction rnd. */
                mpfr_mul_z: (rop, op1, op2, rnd) => gmp.r_mul_z(rop, op1, op2, rnd),
                /** Set rop to op1 / op2 rounded in the direction rnd. */
                mpfr_div_z: (rop, op1, op2, rnd) => gmp.r_div_z(rop, op1, op2, rnd),
                /** Set rop to op1 + op2 rounded in the direction rnd. */
                mpfr_add_z: (rop, op1, op2, rnd) => gmp.r_add_z(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_sub_z: (rop, op1, op2, rnd) => gmp.r_sub_z(rop, op1, op2, rnd),
                /** Set rop to op1 - op2 rounded in the direction rnd. */
                mpfr_z_sub: (rop, op1, op2, rnd) => gmp.r_z_sub(rop, op1, op2, rnd),
                /** Compare op1 and op2. */
                mpfr_cmp_z: (op1, op2) => gmp.r_cmp_z(op1, op2),
                /** Set rop to (op1 * op2) + op3 rounded in the direction rnd. */
                mpfr_fma: (rop, op1, op2, op3, rnd) => gmp.r_fma(rop, op1, op2, op3, rnd),
                /** Set rop to (op1 * op2) - op3 rounded in the direction rnd. */
                mpfr_fms: (rop, op1, op2, op3, rnd) => gmp.r_fms(rop, op1, op2, op3, rnd),
                /** Set rop to (op1 * op2) + (op3 * op4) rounded in the direction rnd. */
                mpfr_fmma: (rop, op1, op2, op3, op4, rnd) => gmp.r_fmma(rop, op1, op2, op3, op4, rnd),
                /** Set rop to (op1 * op2) - (op3 * op4) rounded in the direction rnd. */
                mpfr_fmms: (rop, op1, op2, op3, op4, rnd) => gmp.r_fmms(rop, op1, op2, op3, op4, rnd),
                /** Set rop to the sum of all elements of tab, whose size is n, correctly rounded in the direction rnd. */
                mpfr_sum: (rop, tab, n, rnd) => gmp.r_sum(rop, tab, n, rnd),
                /** Set rop to the dot product of elements of a by those of b, whose common size is n, correctly rounded in the direction rnd. */
                mpfr_dot: (rop, a, b, n, rnd) => gmp.r_dot(rop, a, b, n, rnd),
                /** Free all caches and pools used by MPFR internally. */
                mpfr_free_cache: () => { gmp.r_free_cache(); },
                /** Free various caches and pools used by MPFR internally, as specified by way, which is a set of flags */
                mpfr_free_cache2: (way) => { gmp.r_free_cache2(way); },
                /** Free the pools used by MPFR internally. */
                mpfr_free_pool: () => { gmp.r_free_pool(); },
                /** This function should be called before calling mp_set_memory_functions(allocate_function, reallocate_function, free_function). */
                // mpfr_mp_memory_cleanup: (): c_int => gmp.r_mp_memory_cleanup(),
                /** This function rounds x emulating subnormal number arithmetic. */
                mpfr_subnormalize: (x, t, rnd) => gmp.r_subnormalize(x, t, rnd),
                /** Read a floating-point number from a string nptr in base base, rounded in the direction rnd. */
                mpfr_strtofr: (rop, nptr, endptr, base, rnd) => gmp.r_strtofr(rop, nptr, endptr, base, rnd),
                /** Return the needed size in bytes to store the significand of a floating-point number of precision prec. */
                // mpfr_custom_get_size: (prec: mpfr_prec_t): c_size_t => gmp.r_custom_get_size(prec),
                /** Initialize a significand of precision prec. */
                // mpfr_custom_init: (significand: c_void_ptr, prec: mpfr_prec_t): void => { gmp.r_custom_init(significand, prec); },
                /** Return a pointer to the significand used by a mpfr_t initialized with mpfr_custom_init_set. */
                // mpfr_custom_get_significand: (x: mpfr_srcptr): c_void_ptr => gmp.r_custom_get_significand(x),
                /** Return the exponent of x */
                // mpfr_custom_get_exp: (x: mpfr_srcptr): mpfr_exp_t => gmp.r_custom_get_exp(x),
                /** Inform MPFR that the significand of x has moved due to a garbage collect and update its new position to new_position. */
                // mpfr_custom_move: (x: mpfr_ptr, new_position: c_void_ptr): void => { gmp.r_custom_move(x, new_position); },
                /** Perform a dummy initialization of a mpfr_t. */
                // mpfr_custom_init_set: (x: mpfr_ptr, kind: c_int, exp: mpfr_exp_t, prec: mpfr_prec_t, significand: c_void_ptr): void => { gmp.r_custom_init_set(x, kind, exp, prec, significand); },
                /** Return the current kind of a mpfr_t as created by mpfr_custom_init_set. */
                // mpfr_custom_get_kind: (x: mpfr_srcptr): c_int => gmp.r_custom_get_kind(x),
                /** This function implements the totalOrder predicate from IEEE 754-2008, where -NaN < -Inf < negative finite numbers < -0 < +0 < positive finite numbers < +Inf < +NaN. It returns a non-zero value (true) when x is smaller than or equal to y for this order relation, and zero (false) otherwise */
                mpfr_total_order_p: (x, y) => gmp.r_total_order_p(x, y),
                /**************** Helper functions  ****************/
                /** Converts JS string into MPZ integer */
                mpz_set_string(mpz, input, base) {
                    const srcPtr = getStringPointer(input);
                    const res = gmp.z_set_str(mpz, srcPtr, base);
                    if (srcPtr !== strBuf) {
                        gmp.g_free(srcPtr);
                    }
                    return res;
                },
                /** Initializes new MPFR float from JS string */
                mpz_init_set_string(mpz, input, base) {
                    const srcPtr = getStringPointer(input);
                    const res = gmp.z_init_set_str(mpz, srcPtr, base);
                    if (srcPtr !== strBuf) {
                        gmp.g_free(srcPtr);
                    }
                    return res;
                },
                /** Converts MPZ int into JS string */
                mpz_to_string(x, base) {
                    let destPtr = 0;
                    if (gmp.z_sizeinbase(x, base) + 2 < PREALLOCATED_STR_SIZE) {
                        destPtr = strBuf;
                    }
                    const strPtr = gmp.z_get_str(destPtr, base, x);
                    const endPtr = this.mem.indexOf(0, strPtr);
                    const str = decoder.decode(this.mem.subarray(strPtr, endPtr));
                    if (destPtr !== strBuf) {
                        gmp.g_free(strPtr);
                    }
                    return str;
                },
                /** Converts JS string into MPQ rational */
                mpq_set_string(mpq, input, base) {
                    const srcPtr = getStringPointer(input);
                    const res = gmp.q_set_str(mpq, srcPtr, base);
                    if (srcPtr !== strBuf) {
                        gmp.g_free(srcPtr);
                    }
                    return res;
                },
                /** Converts MPQ rational into JS string */
                mpq_to_string(x, base) {
                    let destPtr = 0;
                    const requiredSize = gmp.z_sizeinbase(gmp.q_numref(x), base) + gmp.z_sizeinbase(gmp.q_denref(x), base) + 3;
                    if (requiredSize < PREALLOCATED_STR_SIZE) {
                        destPtr = strBuf;
                    }
                    const strPtr = gmp.q_get_str(destPtr, base, x);
                    const endPtr = this.mem.indexOf(0, strPtr);
                    const str = decoder.decode(this.mem.subarray(strPtr, endPtr));
                    if (destPtr !== strBuf) {
                        gmp.g_free(strPtr);
                    }
                    return str;
                },
                /** Converts JS string into MPFR float */
                mpfr_set_string(mpfr, input, base, rnd) {
                    const srcPtr = getStringPointer(input);
                    const res = gmp.r_set_str(mpfr, srcPtr, base, rnd);
                    if (srcPtr !== strBuf) {
                        gmp.g_free(srcPtr);
                    }
                    return res;
                },
                /** Initializes new MPFR float from JS string */
                mpfr_init_set_string(mpfr, input, base, rnd) {
                    const srcPtr = getStringPointer(input);
                    const res = gmp.r_init_set_str(mpfr, srcPtr, base, rnd);
                    if (srcPtr !== strBuf) {
                        gmp.g_free(srcPtr);
                    }
                    return res;
                },
                /** Converts MPFR float into JS string */
                mpfr_to_string(x, base, rnd) {
                    const prec = gmp.r_get_prec(x);
                    const n = gmp.r_get_str_ndigits(base, prec);
                    const str = getMPFRString(base, n, x, rnd);
                    return str;
                }
            };
        });
    }

    exports.DivMode = void 0;
    (function (DivMode) {
        DivMode[DivMode["CEIL"] = 0] = "CEIL";
        DivMode[DivMode["FLOOR"] = 1] = "FLOOR";
        DivMode[DivMode["TRUNCATE"] = 2] = "TRUNCATE";
    })(exports.DivMode || (exports.DivMode = {}));
    const INVALID_PARAMETER_ERROR$1 = 'Invalid parameter!';
    function getIntegerContext(gmp, ctx) {
        const mpz_t_arr = [];
        const isInteger = (val) => ctx.intContext.isInteger(val);
        const isRational = (val) => ctx.rationalContext.isRational(val);
        const isFloat = (val) => ctx.floatContext.isFloat(val);
        const compare = (mpz_t, val) => {
            if (typeof val === 'number') {
                assertInt32(val);
                return gmp.mpz_cmp_si(mpz_t, val);
            }
            if (typeof val === 'string') {
                const i = IntegerFn(val);
                return gmp.mpz_cmp(mpz_t, i.mpz_t);
            }
            if (isInteger(val)) {
                return gmp.mpz_cmp(mpz_t, val.mpz_t);
            }
            if (isRational(val)) {
                return -gmp.mpq_cmp_z(val.mpq_t, mpz_t);
            }
            if (isFloat(val)) {
                return -gmp.mpfr_cmp_z(val.mpfr_t, mpz_t);
            }
            throw new Error(INVALID_PARAMETER_ERROR$1);
        };
        const IntPrototype = {
            mpz_t: 0,
            type: 'integer',
            /** Returns the sum of this number and the given one. */
            add(val) {
                if (typeof val === 'number') {
                    assertInt32(val);
                    const n = IntegerFn();
                    if (val < 0) {
                        gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, -val);
                    }
                    else {
                        gmp.mpz_add_ui(n.mpz_t, this.mpz_t, val);
                    }
                    return n;
                }
                if (typeof val === 'string') {
                    const n = IntegerFn(val);
                    gmp.mpz_add(n.mpz_t, this.mpz_t, n.mpz_t);
                    return n;
                }
                if (isInteger(val)) {
                    const n = IntegerFn();
                    gmp.mpz_add(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                if (isRational(val) || isFloat(val)) {
                    return val.add(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the difference of this number and the given one. */
            sub(val) {
                if (typeof val === 'number') {
                    const n = IntegerFn();
                    assertInt32(val);
                    if (val < 0) {
                        gmp.mpz_add_ui(n.mpz_t, this.mpz_t, -val);
                    }
                    else {
                        gmp.mpz_sub_ui(n.mpz_t, this.mpz_t, val);
                    }
                    return n;
                }
                if (typeof val === 'string') {
                    const n = IntegerFn(val);
                    gmp.mpz_sub(n.mpz_t, this.mpz_t, n.mpz_t);
                    return n;
                }
                if (isInteger(val)) {
                    const n = IntegerFn();
                    gmp.mpz_sub(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                if (isRational(val) || isFloat(val)) {
                    return val.neg().add(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the product of this number and the given one. */
            mul(val) {
                if (typeof val === 'number') {
                    const n = IntegerFn();
                    assertInt32(val);
                    gmp.mpz_mul_si(n.mpz_t, this.mpz_t, val);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = IntegerFn(val);
                    gmp.mpz_mul(n.mpz_t, this.mpz_t, n.mpz_t);
                    return n;
                }
                if (isInteger(val)) {
                    const n = IntegerFn();
                    gmp.mpz_mul(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                if (isRational(val) || isFloat(val)) {
                    return val.mul(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the number with inverted sign. */
            neg() {
                const n = IntegerFn();
                gmp.mpz_neg(n.mpz_t, this.mpz_t);
                return n;
            },
            /** Returns the absolute value of this number. */
            abs() {
                const n = IntegerFn();
                gmp.mpz_abs(n.mpz_t, this.mpz_t);
                return n;
            },
            /** Returns the result of the division of this number by the given one. */
            div(val, mode = exports.DivMode.CEIL) {
                if (typeof val === 'number') {
                    const n = IntegerFn(this);
                    assertInt32(val);
                    if (val < 0) {
                        gmp.mpz_neg(n.mpz_t, n.mpz_t);
                        val = -val;
                    }
                    if (mode === exports.DivMode.CEIL) {
                        gmp.mpz_cdiv_q_ui(n.mpz_t, n.mpz_t, val);
                    }
                    else if (mode === exports.DivMode.FLOOR) {
                        gmp.mpz_fdiv_q_ui(n.mpz_t, n.mpz_t, val);
                    }
                    else if (mode === exports.DivMode.TRUNCATE) {
                        gmp.mpz_tdiv_q_ui(n.mpz_t, n.mpz_t, val);
                    }
                    return n;
                }
                if (typeof val === 'string' || isInteger(val)) {
                    const n = IntegerFn(this);
                    const intVal = typeof val === 'string' ? IntegerFn(val) : val;
                    if (mode === exports.DivMode.CEIL) {
                        gmp.mpz_cdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
                    }
                    else if (mode === exports.DivMode.FLOOR) {
                        gmp.mpz_fdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
                    }
                    else if (mode === exports.DivMode.TRUNCATE) {
                        gmp.mpz_tdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
                    }
                    return n;
                }
                if (isRational(val)) {
                    return val.invert().mul(this);
                }
                if (isFloat(val)) {
                    return ctx.floatContext.Float(this).div(val);
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns this number exponentiated to the given value. */
            pow(exp, mod) {
                if (typeof exp === 'number') {
                    const n = IntegerFn();
                    assertUint32(exp);
                    if (mod !== undefined) {
                        if (typeof mod === 'number') {
                            assertUint32(mod);
                            gmp.mpz_powm_ui(n.mpz_t, this.mpz_t, exp, IntegerFn(mod).mpz_t);
                        }
                        else {
                            gmp.mpz_powm_ui(n.mpz_t, this.mpz_t, exp, mod.mpz_t);
                        }
                    }
                    else {
                        gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, exp);
                    }
                    return n;
                }
                if (isInteger(exp)) {
                    const n = IntegerFn();
                    if (mod !== undefined) {
                        if (typeof mod === 'number') {
                            assertUint32(mod);
                            gmp.mpz_powm(n.mpz_t, this.mpz_t, exp.mpz_t, IntegerFn(mod).mpz_t);
                        }
                        else {
                            gmp.mpz_powm(n.mpz_t, this.mpz_t, exp.mpz_t, mod.mpz_t);
                        }
                    }
                    else {
                        const expNum = exp.toNumber();
                        assertUint32(expNum);
                        gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, expNum);
                    }
                    return n;
                }
                if (isRational(exp) && mod === undefined) {
                    const n = IntegerFn();
                    const numerator = exp.numerator().toNumber();
                    assertUint32(numerator);
                    const denominator = exp.denominator().toNumber();
                    assertUint32(denominator);
                    gmp.mpz_pow_ui(n.mpz_t, this.mpz_t, numerator);
                    gmp.mpz_root(n.mpz_t, n.mpz_t, denominator);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the integer square root number, rounded down. */
            sqrt() {
                const n = IntegerFn();
                gmp.mpz_sqrt(n.mpz_t, this.mpz_t);
                return n;
            },
            /** Returns the truncated integer part of the nth root */
            nthRoot(nth) {
                const n = IntegerFn();
                assertUint32(nth);
                gmp.mpz_root(n.mpz_t, this.mpz_t, nth);
                return n;
            },
            /** Returns the factorial */
            factorial() {
                if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
                    throw new Error('Out of bounds!');
                }
                const n = IntegerFn();
                const value = gmp.mpz_get_ui(this.mpz_t);
                gmp.mpz_fac_ui(n.mpz_t, value);
                return n;
            },
            /** Returns the double factorial */
            doubleFactorial() {
                if (gmp.mpz_fits_ulong_p(this.mpz_t) === 0) {
                    throw new Error('Out of bounds!');
                }
                const n = IntegerFn();
                const value = gmp.mpz_get_ui(this.mpz_t);
                gmp.mpz_2fac_ui(n.mpz_t, value);
                return n;
            },
            /** Determines whether a number is prime using some trial divisions, then reps Miller-Rabin probabilistic primality tests. */
            isProbablyPrime(reps = 20) {
                assertUint32(reps);
                const ret = gmp.mpz_probab_prime_p(this.mpz_t, reps);
                if (ret === 0)
                    return false; // definitely non-prime
                if (ret === 1)
                    return 'probably-prime';
                if (ret === 2)
                    return true; // definitely prime
            },
            /** Identifies primes using a probabilistic algorithm; the chance of a composite passing will be extremely small. */
            nextPrime() {
                const n = IntegerFn();
                gmp.mpz_nextprime(n.mpz_t, this.mpz_t);
                return n;
            },
            /** Returns the greatest common divisor of this number and the given one. */
            gcd(val) {
                const n = IntegerFn();
                if (typeof val === 'number') {
                    assertUint32(val);
                    gmp.mpz_gcd_ui(n.mpz_t, this.mpz_t, val);
                    return n;
                }
                if (isInteger(val)) {
                    gmp.mpz_gcd(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the least common multiple of this number and the given one. */
            lcm(val) {
                const n = IntegerFn();
                if (typeof val === 'number') {
                    assertUint32(val);
                    gmp.mpz_lcm_ui(n.mpz_t, this.mpz_t, val);
                    return n;
                }
                if (isInteger(val)) {
                    gmp.mpz_lcm(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the one's complement. */
            complement1() {
                const n = IntegerFn();
                gmp.mpz_com(n.mpz_t, this.mpz_t);
                return n;
            },
            /** Returns the two's complement. */
            complement2() {
                const n = IntegerFn();
                gmp.mpz_com(n.mpz_t, this.mpz_t);
                gmp.mpz_add_ui(n.mpz_t, n.mpz_t, 1);
                return n;
            },
            /** Returns the integer bitwise-and combined with another integer. */
            and(val) {
                const n = IntegerFn();
                if (typeof val === 'number') {
                    assertUint32(val);
                    gmp.mpz_and(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
                    return n;
                }
                if (isInteger(val)) {
                    gmp.mpz_and(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the integer bitwise-or combined with another integer. */
            or(val) {
                const n = IntegerFn();
                if (typeof val === 'number') {
                    assertUint32(val);
                    gmp.mpz_ior(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
                    return n;
                }
                if (isInteger(val)) {
                    gmp.mpz_ior(n.mpz_t, this.mpz_t, val.mpz_t);
                    return n;
                }
                throw new Error(INVALID_PARAMETER_ERROR$1);
            },
            /** Returns the integer bitwise-xor combined with another integer. */
            xor(val) {
                const n = IntegerFn();
                if (typeof val === 'number') {
                    assertUint32(val);
                    gmp.mpz_xor(n.mpz_t, this.mpz_t, IntegerFn(val).mpz_t);
                }
                else {
                    gmp.mpz_xor(n.mpz_t, this.mpz_t, val.mpz_t);
                }
                return n;
            },
            /** Returns the integer left shifted by a given number of bits. */
            shiftLeft(val) {
                assertUint32(val);
                const n = IntegerFn();
                gmp.mpz_mul_2exp(n.mpz_t, this.mpz_t, val);
                return n;
            },
            /** Returns the integer right shifted by a given number of bits. */
            shiftRight(val) {
                assertUint32(val);
                const n = IntegerFn();
                gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, val);
                return n;
            },
            /** Sets the value of bit i to 1. The least significant bit is number 0 */
            setBit(i) {
                const n = IntegerFn(this);
                assertUint32(i);
                gmp.mpz_setbit(n.mpz_t, i);
                return n;
            },
            /** Sets the value of multiple bits to 1. The least significant bit is number 0 */
            setBits(indices) {
                const n = IntegerFn(this);
                assertArray(indices);
                indices.forEach(i => {
                    assertUint32(i);
                    gmp.mpz_setbit(n.mpz_t, i);
                });
                return n;
            },
            /** Sets the value of bit i to 0. The least significant bit is number 0 */
            clearBit(index) {
                const n = IntegerFn(this);
                assertUint32(index);
                gmp.mpz_clrbit(n.mpz_t, index);
                return n;
            },
            /** Sets the value of multiple bits to 0. The least significant bit is number 0 */
            clearBits(indices) {
                const n = IntegerFn(this);
                assertArray(indices);
                indices.forEach(i => {
                    assertUint32(i);
                    gmp.mpz_clrbit(n.mpz_t, i);
                });
                return n;
            },
            /** Inverts the value of bit i. The least significant bit is number 0 */
            flipBit(index) {
                const n = IntegerFn(this);
                assertUint32(index);
                gmp.mpz_combit(n.mpz_t, index);
                return n;
            },
            /** Inverts the value of multiple bits. The least significant bit is number 0 */
            flipBits(indices) {
                const n = IntegerFn(this);
                assertArray(indices);
                indices.forEach(i => {
                    assertUint32(i);
                    gmp.mpz_combit(n.mpz_t, i);
                });
                return n;
            },
            /** Returns 0 or 1 based on the value of a bit at the provided index. The least significant bit is number 0 */
            getBit(index) {
                assertUint32(index);
                return gmp.mpz_tstbit(this.mpz_t, index);
            },
            // Returns the position of the most significant bit. The least significant bit is number 0.
            msbPosition() {
                return gmp.mpz_sizeinbase(this.mpz_t, 2) - 1;
            },
            /** Works similarly to JS Array.slice() but on bits. The least significant bit is number 0 */
            sliceBits(start, end) {
                if (start === undefined)
                    start = 0;
                assertInt32(start);
                const msb = gmp.mpz_sizeinbase(this.mpz_t, 2);
                if (start < 0)
                    start = msb + start;
                start = Math.max(0, start);
                if (end === undefined)
                    end = msb + 1;
                assertInt32(end);
                if (end < 0)
                    end = msb + end;
                end = Math.min(msb + 1, end);
                if (start >= end)
                    return IntegerFn(0);
                const n = IntegerFn(1);
                if (end < msb + 1) {
                    gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, end);
                    gmp.mpz_sub_ui(n.mpz_t, n.mpz_t, 1);
                    gmp.mpz_and(n.mpz_t, this.mpz_t, n.mpz_t);
                    gmp.mpz_fdiv_q_2exp(n.mpz_t, n.mpz_t, start);
                }
                else {
                    gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, start);
                }
                return n;
            },
            /** Creates new integer with the copy of binary representation of num to position offset. Optionally bitCount can be used to zero-pad the number to a specific number of bits. The least significant bit is number 0 */
            writeTo(num, offset = 0, bitCount) {
                assertUint32(offset);
                if (!isInteger(num))
                    throw new Error('Only Integers are supported');
                if (bitCount === undefined) {
                    bitCount = gmp.mpz_sizeinbase(num.mpz_t, 2);
                }
                assertUint32(bitCount);
                const aux = IntegerFn();
                const n = IntegerFn();
                gmp.mpz_fdiv_q_2exp(n.mpz_t, this.mpz_t, offset + bitCount);
                gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, bitCount);
                gmp.mpz_tdiv_r_2exp(aux.mpz_t, num.mpz_t, bitCount);
                gmp.mpz_ior(n.mpz_t, n.mpz_t, aux.mpz_t);
                gmp.mpz_tdiv_r_2exp(aux.mpz_t, this.mpz_t, offset);
                gmp.mpz_mul_2exp(n.mpz_t, n.mpz_t, offset);
                gmp.mpz_ior(n.mpz_t, n.mpz_t, aux.mpz_t);
                return n;
            },
            /** Returns true if the current number is equal to the provided number */
            isEqual(val) {
                return compare(this.mpz_t, val) === 0;
            },
            /** Returns true if the current number is less than the provided number */
            lessThan(val) {
                return compare(this.mpz_t, val) < 0;
            },
            /** Returns true if the current number is less than or equal to the provided number */
            lessOrEqual(val) {
                return compare(this.mpz_t, val) <= 0;
            },
            /** Returns true if the current number is greater than the provided number */
            greaterThan(val) {
                return compare(this.mpz_t, val) > 0;
            },
            /** Returns true if the current number is greater than or equal to the provided number */
            greaterOrEqual(val) {
                return compare(this.mpz_t, val) >= 0;
            },
            /** Returns the sign of the current value (-1 or 0 or 1) */
            sign() {
                return gmp.mpz_sgn(this.mpz_t);
            },
            /** Converts current value into a JavaScript number */
            toNumber() {
                if (gmp.mpz_fits_slong_p(this.mpz_t) === 0) {
                    return gmp.mpz_get_d(this.mpz_t);
                }
                return gmp.mpz_get_si(this.mpz_t);
            },
            /** Exports integer into an Uint8Array. Sign is ignored. */
            toBuffer(littleEndian = false) {
                const countPtr = gmp.malloc(4);
                const startptr = gmp.mpz_export(0, countPtr, littleEndian ? -1 : 1, 1, 1, 0, this.mpz_t);
                const size = gmp.memView.getUint32(countPtr, true);
                const endptr = startptr + size;
                const buf = gmp.mem.slice(startptr, endptr);
                gmp.free(startptr);
                gmp.free(countPtr);
                return buf;
            },
            /** Converts the number to string */
            toString(radix = 10) {
                if (!Number.isSafeInteger(radix) || radix < 2 || radix > 62) {
                    throw new Error('radix must have a value between 2 and 62');
                }
                return gmp.mpz_to_string(this.mpz_t, radix);
            },
            /** Converts the number to a rational number */
            toRational() {
                return ctx.rationalContext.Rational(this);
            },
            /** Converts the number to a floating-point number */
            toFloat() {
                return ctx.floatContext.Float(this);
            },
        };
        const IntegerFn = (num, radix = 10) => {
            const instance = Object.create(IntPrototype);
            instance.mpz_t = gmp.mpz_t();
            if (num === undefined) {
                gmp.mpz_init(instance.mpz_t);
            }
            else if (typeof num === 'string') {
                assertValidRadix(radix);
                const res = gmp.mpz_init_set_string(instance.mpz_t, num, radix);
                if (res !== 0) {
                    throw new Error('Invalid number provided!');
                }
            }
            else if (typeof num === 'number') {
                assertInt32(num);
                gmp.mpz_init_set_si(instance.mpz_t, num);
            }
            else if (isInteger(num)) {
                gmp.mpz_init_set(instance.mpz_t, num.mpz_t);
            }
            else if (ArrayBuffer.isView(num)) {
                if (!(num instanceof Uint8Array)) {
                    throw new Error('Only Uint8Array is supported!');
                }
                gmp.mpz_init(instance.mpz_t);
                const wasmBufPtr = gmp.malloc(num.length);
                gmp.mem.set(num, wasmBufPtr);
                gmp.mpz_import(instance.mpz_t, num.length, 1, 1, 1, 0, wasmBufPtr);
                gmp.free(wasmBufPtr);
            }
            else if (isRational(num)) {
                gmp.mpz_init(instance.mpz_t);
                const f = ctx.floatContext.Float(num);
                gmp.mpfr_get_z(instance.mpz_t, f.mpfr_t, 0);
            }
            else if (isFloat(num)) {
                gmp.mpz_init(instance.mpz_t);
                gmp.mpfr_get_z(instance.mpz_t, num.mpfr_t, num.rndMode);
            }
            else {
                gmp.mpz_t_free(instance.mpz_t);
                throw new Error('Invalid value for the Integer type!');
            }
            mpz_t_arr.push(instance.mpz_t);
            return instance;
        };
        return {
            Integer: IntegerFn,
            isInteger: (val) => IntPrototype.isPrototypeOf(val),
            destroy: () => {
                for (let i = mpz_t_arr.length - 1; i >= 0; i--) {
                    gmp.mpz_clear(mpz_t_arr[i]);
                    gmp.mpz_t_free(mpz_t_arr[i]);
                }
                mpz_t_arr.length = 0;
            }
        };
    }

    const INVALID_PARAMETER_ERROR = 'Invalid parameter!';
    function getRationalContext(gmp, ctx) {
        const mpq_t_arr = [];
        const isInteger = (val) => ctx.intContext.isInteger(val);
        const isRational = (val) => ctx.rationalContext.isRational(val);
        const isFloat = (val) => ctx.floatContext.isFloat(val);
        const compare = (mpq_t, val) => {
            if (typeof val === 'number') {
                assertInt32(val);
                return gmp.mpq_cmp_si(mpq_t, val, 1);
            }
            if (typeof val === 'string') {
                const r = RationalFn(val);
                return gmp.mpq_cmp(mpq_t, r.mpq_t);
            }
            if (isInteger(val)) {
                return gmp.mpq_cmp_z(mpq_t, val.mpz_t);
            }
            if (isRational(val)) {
                return gmp.mpq_cmp(mpq_t, val.mpq_t);
            }
            if (isFloat(val)) {
                return -gmp.mpfr_cmp_q(val.mpfr_t, mpq_t);
            }
            throw new Error(INVALID_PARAMETER_ERROR);
        };
        const RationalPrototype = {
            mpq_t: 0,
            type: 'rational',
            /** Returns the sum of this number and the given one. */
            add(val) {
                if (typeof val === 'number' || isInteger(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_add(n.mpq_t, this.mpq_t, RationalFn(val).mpq_t);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = RationalFn(val);
                    gmp.mpq_add(n.mpq_t, this.mpq_t, n.mpq_t);
                    return n;
                }
                if (isRational(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_add(n.mpq_t, this.mpq_t, val.mpq_t);
                    return n;
                }
                if (isFloat(val)) {
                    return val.add(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR);
            },
            /** Returns the difference of this number and the given one. */
            sub(val) {
                if (typeof val === 'number' || isInteger(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_sub(n.mpq_t, this.mpq_t, RationalFn(val).mpq_t);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = RationalFn(val);
                    gmp.mpq_sub(n.mpq_t, this.mpq_t, n.mpq_t);
                    return n;
                }
                if (isRational(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_sub(n.mpq_t, this.mpq_t, val.mpq_t);
                    return n;
                }
                if (isFloat(val)) {
                    return val.neg().add(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR);
            },
            /** Returns the product of this number and the given one. */
            mul(val) {
                if (typeof val === 'number' || isInteger(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_mul(n.mpq_t, this.mpq_t, RationalFn(val).mpq_t);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = RationalFn(val);
                    gmp.mpq_mul(n.mpq_t, this.mpq_t, n.mpq_t);
                    return n;
                }
                if (isRational(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_mul(n.mpq_t, this.mpq_t, val.mpq_t);
                    return n;
                }
                if (isFloat(val)) {
                    return val.mul(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR);
            },
            /** Returns the number with inverted sign. */
            neg() {
                const n = RationalFn(0, 1);
                gmp.mpq_neg(n.mpq_t, this.mpq_t);
                return n;
            },
            /** Returns the inverse of the number. */
            invert() {
                const n = RationalFn(0, 1);
                gmp.mpq_inv(n.mpq_t, this.mpq_t);
                return n;
            },
            /** Returns the absolute value of this number. */
            abs() {
                const n = RationalFn(0, 1);
                gmp.mpq_abs(n.mpq_t, this.mpq_t);
                return n;
            },
            /** Returns the result of the division of this number by the given one. */
            div(val) {
                if (typeof val === 'number' || isInteger(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_div(n.mpq_t, this.mpq_t, RationalFn(val).mpq_t);
                    return n;
                }
                if (typeof val === 'string') {
                    const n = RationalFn(val);
                    gmp.mpq_div(n.mpq_t, this.mpq_t, n.mpq_t);
                    return n;
                }
                if (isRational(val)) {
                    const n = RationalFn(0, 1);
                    gmp.mpq_div(n.mpq_t, this.mpq_t, val.mpq_t);
                    return n;
                }
                if (isFloat(val)) {
                    return ctx.floatContext.Float(this).div(val);
                }
                throw new Error(INVALID_PARAMETER_ERROR);
            },
            /** Returns true if the current number is equal to the provided number */
            isEqual(val) {
                if (typeof val === 'number' || isInteger(val)) {
                    return gmp.mpq_equal(this.mpq_t, RationalFn(val).mpq_t) !== 0;
                }
                if (typeof val === 'string') {
                    const n = RationalFn(val);
                    return gmp.mpq_equal(this.mpq_t, n.mpq_t) !== 0;
                }
                if (isRational(val)) {
                    return gmp.mpq_equal(this.mpq_t, val.mpq_t) !== 0;
                }
                if (isFloat(val)) {
                    return val.isEqual(this);
                }
                throw new Error(INVALID_PARAMETER_ERROR);
            },
            /** Returns true if the current number is less than the provided number */
            lessThan(val) {
                return compare(this.mpq_t, val) < 0;
            },
            /** Returns true if the current number is less than or equal to the provided number */
            lessOrEqual(val) {
                return compare(this.mpq_t, val) <= 0;
            },
            /** Returns true if the current number is greater than the provided number */
            greaterThan(val) {
                return compare(this.mpq_t, val) > 0;
            },
            /** Returns true if the current number is greater than or equal to the provided number */
            greaterOrEqual(val) {
                return compare(this.mpq_t, val) >= 0;
            },
            /** Returns the numerator of the number */
            numerator() {
                const n = ctx.intContext.Integer();
                gmp.mpq_get_num(n.mpz_t, this.mpq_t);
                return n;
            },
            /** Returns the denominator of the number */
            denominator() {
                const n = ctx.intContext.Integer();
                gmp.mpq_get_den(n.mpz_t, this.mpq_t);
                return n;
            },
            /** Returns the sign of the current value (-1 or 0 or 1) */
            sign() {
                return gmp.mpq_sgn(this.mpq_t);
            },
            /** Converts current value to a JavaScript number */
            toNumber() {
                return gmp.mpq_get_d(this.mpq_t);
            },
            /** Converts the number to string */
            toString(radix = 10) {
                if (!Number.isSafeInteger(radix) || radix < 2 || radix > 62) {
                    throw new Error('radix must have a value between 2 and 62');
                }
                return gmp.mpq_to_string(this.mpq_t, radix);
            },
            /** Converts the number to an integer */
            toInteger() {
                return ctx.intContext.Integer(this);
            },
            /** Converts the number to a floating-point number */
            toFloat() {
                return ctx.floatContext.Float(this);
            },
        };
        const parseParameters = (mpq_t, p1, p2) => {
            if (typeof p1 === 'number' && (p2 === undefined || typeof p2 === 'number')) {
                assertInt32(p1);
                if (p2 !== undefined) {
                    assertInt32(p2);
                    gmp.mpq_set_si(mpq_t, p1, Math.abs(p2));
                    if (p2 < 0) {
                        gmp.mpq_neg(mpq_t, mpq_t);
                    }
                }
                else {
                    gmp.mpq_set_si(mpq_t, p1, 1);
                }
                return;
            }
            if (isInteger(p1) && p2 === undefined) {
                gmp.mpq_set_z(mpq_t, p1.mpz_t);
                return;
            }
            if (isRational(p1) && p2 === undefined) {
                gmp.mpq_set(mpq_t, p1.mpq_t);
                return;
            }
            const finalString = p2 !== undefined ? `${p1.toString()}/${p2.toString()}` : p1.toString();
            const res = gmp.mpq_set_string(mpq_t, finalString, 10);
            if (res !== 0) {
                throw new Error('Invalid number provided!');
            }
        };
        const RationalFn = (p1, p2) => {
            const instance = Object.create(RationalPrototype);
            instance.mpq_t = gmp.mpq_t();
            gmp.mpq_init(instance.mpq_t);
            parseParameters(instance.mpq_t, p1, p2);
            gmp.mpq_canonicalize(instance.mpq_t);
            mpq_t_arr.push(instance.mpq_t);
            return instance;
        };
        return {
            Rational: RationalFn,
            isRational: (val) => RationalPrototype.isPrototypeOf(val),
            destroy: () => {
                for (let i = mpq_t_arr.length - 1; i >= 0; i--) {
                    gmp.mpq_clear(mpq_t_arr[i]);
                    gmp.mpq_t_free(mpq_t_arr[i]);
                }
                mpq_t_arr.length = 0;
            }
        };
    }

    exports.mpfr_rnd_t = void 0;
    (function (mpfr_rnd_t) {
        /** Round to nearest, with ties to even */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDN"] = 0] = "MPFR_RNDN";
        /** Round toward zero */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDZ"] = 1] = "MPFR_RNDZ";
        /** Round toward +Inf */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDU"] = 2] = "MPFR_RNDU";
        /** Round toward -Inf */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDD"] = 3] = "MPFR_RNDD";
        /** Round away from zero */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDA"] = 4] = "MPFR_RNDA";
        /** (Experimental) Faithful rounding */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDF"] = 5] = "MPFR_RNDF";
        /** (Experimental) Round to nearest, with ties away from zero (mpfr_round) */
        mpfr_rnd_t[mpfr_rnd_t["MPFR_RNDNA"] = -1] = "MPFR_RNDNA";
    })(exports.mpfr_rnd_t || (exports.mpfr_rnd_t = {}));
    exports.mpfr_flags = void 0;
    (function (mpfr_flags) {
        mpfr_flags[mpfr_flags["MPFR_FLAGS_UNDERFLOW"] = 1] = "MPFR_FLAGS_UNDERFLOW";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_OVERFLOW"] = 2] = "MPFR_FLAGS_OVERFLOW";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_NAN"] = 4] = "MPFR_FLAGS_NAN";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_INEXACT"] = 8] = "MPFR_FLAGS_INEXACT";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_ERANGE"] = 16] = "MPFR_FLAGS_ERANGE";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_DIVBY0"] = 32] = "MPFR_FLAGS_DIVBY0";
        mpfr_flags[mpfr_flags["MPFR_FLAGS_ALL"] = 63] = "MPFR_FLAGS_ALL";
    })(exports.mpfr_flags || (exports.mpfr_flags = {}));
    exports.mpfr_free_cache_t = void 0;
    (function (mpfr_free_cache_t) {
        mpfr_free_cache_t[mpfr_free_cache_t["MPFR_FREE_LOCAL_CACHE"] = 1] = "MPFR_FREE_LOCAL_CACHE";
        mpfr_free_cache_t[mpfr_free_cache_t["MPFR_FREE_GLOBAL_CACHE"] = 2] = "MPFR_FREE_GLOBAL_CACHE"; /* 1 << 1 */
    })(exports.mpfr_free_cache_t || (exports.mpfr_free_cache_t = {}));

    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            const binding = yield getGMPInterface();
            const createContext = (options) => {
                const ctx = {
                    intContext: null,
                    rationalContext: null,
                    floatContext: null,
                };
                ctx.intContext = getIntegerContext(binding, ctx);
                ctx.rationalContext = getRationalContext(binding, ctx);
                ctx.floatContext = getFloatContext(binding, ctx, options);
                return {
                    types: {
                        Integer: ctx.intContext.Integer,
                        Rational: ctx.rationalContext.Rational,
                        Float: ctx.floatContext.Float,
                        Pi: ctx.floatContext.Pi,
                        EulerConstant: ctx.floatContext.EulerConstant,
                        EulerNumber: ctx.floatContext.EulerNumber,
                        Log2: ctx.floatContext.Log2,
                        Catalan: ctx.floatContext.Catalan,
                    },
                    destroy: () => {
                        ctx.intContext.destroy();
                        ctx.rationalContext.destroy();
                        ctx.floatContext.destroy();
                    },
                };
            };
            return {
                binding,
                calculate: (fn, options = {}) => {
                    const context = createContext(options);
                    if (typeof fn !== 'function') {
                        throw new Error('calculate() requires a callback function');
                    }
                    const fnRes = fn(context.types);
                    const res = fnRes === null || fnRes === void 0 ? void 0 : fnRes.toString();
                    context.destroy();
                    return res;
                },
                getContext: (options = {}) => {
                    const context = createContext(options);
                    return Object.assign(Object.assign({}, context.types), { destroy: context.destroy });
                },
                /** Resets the WASM instance (clears all previously allocated objects) */
                reset: () => __awaiter(this, void 0, void 0, function* () {
                    return binding.reset();
                }),
            };
        });
    }
    const precisionToBits = (digits) => Math.ceil(digits * 3.3219281); // digits * log2(10)

    exports.init = init;
    exports.precisionToBits = precisionToBits;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
