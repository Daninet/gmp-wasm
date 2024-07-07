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

    const gmpWasmLength = 276179;
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
