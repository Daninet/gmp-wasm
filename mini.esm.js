/*!
 * gmp-wasm v1.1.0 (https://www.npmjs.com/package/gmp-wasm)
 * (c) Dani Biro
 * @license LGPL-3.0
 */

/*! *****************************************************************************
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
        throw new Error('Invalid number specified: uint32_t is required');
    }
}
function isInt32(num) {
    return Number.isSafeInteger(num) && num >= -Math.pow(2, 31) && num < Math.pow(2, 31);
}
function assertInt32(num) {
    if (!isInt32(num)) {
        throw new Error('Invalid number specified: int32_t is required');
    }
}
function assertArray(arr) {
    if (!Array.isArray(arr)) {
        throw new Error('Invalid parameter specified. Array is required!');
    }
}
function isValidRadix(radix) {
    return Number.isSafeInteger(radix) && radix >= 2 && radix <= 36;
}
function assertValidRadix(radix) {
    if (!isValidRadix(radix)) {
        throw new Error('radix must have a value between 2 and 36');
    }
}
const FLOAT_SPECIAL_VALUES = {
    '@NaN@': 'NaN',
    '@Inf@': 'Infinity',
    '-@Inf@': '-Infinity',
};
const FLOAT_SPECIAL_VALUE_KEYS = Object.keys(FLOAT_SPECIAL_VALUES);
const trimTrailingZeros = (num) => {
    let pos = num.length - 1;
    while (pos >= 0) {
        if (num[pos] === '.') {
            pos--;
            break;
        }
        else if (num[pos] === '0') {
            pos--;
        }
        else {
            break;
        }
    }
    if (pos !== num.length - 1) {
        return num.slice(0, pos + 1);
    }
    if (num.length === 0) {
        return '0';
    }
    return num;
};
const insertDecimalPoint = (mantissa, pointPos) => {
    const isNegative = mantissa.startsWith('-');
    const mantissaWithoutSign = isNegative ? mantissa.slice(1) : mantissa;
    const sign = isNegative ? '-' : '';
    let hasDecimalPoint = false;
    if (pointPos <= 0) {
        const zeros = '0'.repeat(-pointPos);
        mantissa = `${sign}0.${zeros}${mantissaWithoutSign}`;
        hasDecimalPoint = true;
    }
    else if (pointPos < mantissaWithoutSign.length) {
        mantissa = `${sign}${mantissaWithoutSign.slice(0, pointPos)}.${mantissaWithoutSign.slice(pointPos)}`;
        hasDecimalPoint = true;
    }
    else {
        const zeros = '0'.repeat(pointPos - mantissaWithoutSign.length);
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
var FloatRoundingMode;
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
})(FloatRoundingMode || (FloatRoundingMode = {}));
const INVALID_PARAMETER_ERROR$2 = 'Invalid parameter!';
function getFloatContext(gmp, ctx, ctxOptions) {
    var _a, _b, _c;
    const mpfr_t_arr = [];
    const isInteger = (val) => ctx.intContext.isInteger(val);
    const isRational = (val) => ctx.rationalContext.isRational(val);
    const isFloat = (val) => ctx.floatContext.isFloat(val);
    const globalRndMode = ((_a = ctxOptions.roundingMode) !== null && _a !== void 0 ? _a : FloatRoundingMode.ROUND_NEAREST);
    const globalPrecisionBits = (_b = ctxOptions.precisionBits) !== null && _b !== void 0 ? _b : 52;
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

const gmpWasmLength = 276640;
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
    const heap = { HEAP8: new Uint8Array(0) };
    const errorHandler = () => {
        throw new Error('Fatal error in gmp-wasm');
    };
    const wasmInstance = yield WebAssembly.instantiate(compiledModule, {
        env: {
            emscripten_notify_memory_growth: () => {
                heap.HEAP8 = new Uint8Array(wasmInstance.exports.memory.buffer);
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
    instance = Object.assign({ heap }, exports);
    return instance;
});

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const PREALLOCATED_STR_SIZE = 2 * 1024;
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
            get memView() { return new DataView(gmp.heap.HEAP8.buffer, gmp.heap.HEAP8.byteOffset, gmp.heap.HEAP8.byteLength); },
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
            mpfr_get_patches: () => gmp.r_get_patches(),
            /** Return a non-zero value if MPFR was compiled as thread safe using compiler-level Thread Local Storage, return zero otherwise. */
            mpfr_buildopt_tls_p: () => gmp.r_buildopt_tls_p(),
            /** Return a non-zero value if MPFR was compiled with ‘__float128’ support, return zero otherwise. */
            mpfr_buildopt_float128_p: () => gmp.r_buildopt_float128_p(),
            /** Return a non-zero value if MPFR was compiled with decimal float support, return zero otherwise. */
            mpfr_buildopt_decimal_p: () => gmp.r_buildopt_decimal_p(),
            /** Return a non-zero value if MPFR was compiled with GMP internals, return zero otherwise. */
            mpfr_buildopt_gmpinternals_p: () => gmp.r_buildopt_gmpinternals_p(),
            /** Return a non-zero value if MPFR was compiled so that all threads share the same cache for one MPFR constant, return zero otherwise. */
            mpfr_buildopt_sharedcache_p: () => gmp.r_buildopt_sharedcache_p(),
            /** Return a string saying which thresholds file has been used at compile time. */
            mpfr_buildopt_tune_case: () => gmp.r_buildopt_tune_case(),
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
            mpfr_print_rnd_mode: (rnd) => gmp.r_print_rnd_mode(rnd),
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
            /** Output op on stdout in some unspecified format, then a newline character. This function is mainly for debugging purpose. Thus invalid data may be supported. */
            mpfr_dump: (op) => { gmp.r_dump(op); },
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
            mpfr_mp_memory_cleanup: () => gmp.r_mp_memory_cleanup(),
            /** This function rounds x emulating subnormal number arithmetic. */
            mpfr_subnormalize: (x, t, rnd) => gmp.r_subnormalize(x, t, rnd),
            /** Read a floating-point number from a string nptr in base base, rounded in the direction rnd. */
            mpfr_strtofr: (rop, nptr, endptr, base, rnd) => gmp.r_strtofr(rop, nptr, endptr, base, rnd),
            /** Return the needed size in bytes to store the significand of a floating-point number of precision prec. */
            mpfr_custom_get_size: (prec) => gmp.r_custom_get_size(prec),
            /** Initialize a significand of precision prec. */
            mpfr_custom_init: (significand, prec) => { gmp.r_custom_init(significand, prec); },
            /** Return a pointer to the significand used by a mpfr_t initialized with mpfr_custom_init_set. */
            mpfr_custom_get_significand: (x) => gmp.r_custom_get_significand(x),
            /** Return the exponent of x */
            mpfr_custom_get_exp: (x) => gmp.r_custom_get_exp(x),
            /** Inform MPFR that the significand of x has moved due to a garbage collect and update its new position to new_position. */
            mpfr_custom_move: (x, new_position) => { gmp.r_custom_move(x, new_position); },
            /** Perform a dummy initialization of a mpfr_t. */
            mpfr_custom_init_set: (x, kind, exp, prec, significand) => { gmp.r_custom_init_set(x, kind, exp, prec, significand); },
            /** Return the current kind of a mpfr_t as created by mpfr_custom_init_set. */
            mpfr_custom_get_kind: (x) => gmp.r_custom_get_kind(x),
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
                let destPtr = 0;
                const n = gmp.r_get_str_ndigits(base, gmp.r_get_prec(x));
                const requiredSize = Math.max(7, n + 2);
                if (requiredSize < PREALLOCATED_STR_SIZE) {
                    destPtr = strBuf;
                }
                const strPtr = gmp.r_get_str(destPtr, mpfr_exp_t_ptr, base, n, x, rnd);
                const endPtr = this.mem.indexOf(0, strPtr);
                let str = decoder.decode(this.mem.subarray(strPtr, endPtr));
                if (FLOAT_SPECIAL_VALUE_KEYS.includes(str)) {
                    str = FLOAT_SPECIAL_VALUES[str];
                }
                else {
                    // decimal point needs to be inserted
                    const pointPos = this.memView.getInt32(mpfr_exp_t_ptr, true);
                    str = insertDecimalPoint(str, pointPos);
                }
                if (destPtr !== strBuf) {
                    gmp.r_free_str(strPtr);
                }
                return str;
            }
        };
    });
}

var DivMode;
(function (DivMode) {
    DivMode[DivMode["CEIL"] = 0] = "CEIL";
    DivMode[DivMode["FLOOR"] = 1] = "FLOOR";
    DivMode[DivMode["TRUNCATE"] = 2] = "TRUNCATE";
})(DivMode || (DivMode = {}));
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
        div(val, mode = DivMode.CEIL) {
            if (typeof val === 'number') {
                const n = IntegerFn(this);
                assertInt32(val);
                if (val < 0) {
                    gmp.mpz_neg(n.mpz_t, n.mpz_t);
                    val = -val;
                }
                if (mode === DivMode.CEIL) {
                    gmp.mpz_cdiv_q_ui(n.mpz_t, n.mpz_t, val);
                }
                else if (mode === DivMode.FLOOR) {
                    gmp.mpz_fdiv_q_ui(n.mpz_t, n.mpz_t, val);
                }
                else if (mode === DivMode.TRUNCATE) {
                    gmp.mpz_tdiv_q_ui(n.mpz_t, n.mpz_t, val);
                }
                return n;
            }
            if (typeof val === 'string' || isInteger(val)) {
                const n = IntegerFn(this);
                const intVal = typeof val === 'string' ? IntegerFn(val) : val;
                if (mode === DivMode.CEIL) {
                    gmp.mpz_cdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
                }
                else if (mode === DivMode.FLOOR) {
                    gmp.mpz_fdiv_q(n.mpz_t, this.mpz_t, intVal.mpz_t);
                }
                else if (mode === DivMode.TRUNCATE) {
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

var mpfr_rnd_t;
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
})(mpfr_rnd_t || (mpfr_rnd_t = {}));
var mpfr_flags;
(function (mpfr_flags) {
    mpfr_flags[mpfr_flags["MPFR_FLAGS_UNDERFLOW"] = 1] = "MPFR_FLAGS_UNDERFLOW";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_OVERFLOW"] = 2] = "MPFR_FLAGS_OVERFLOW";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_NAN"] = 4] = "MPFR_FLAGS_NAN";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_INEXACT"] = 8] = "MPFR_FLAGS_INEXACT";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_ERANGE"] = 16] = "MPFR_FLAGS_ERANGE";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_DIVBY0"] = 32] = "MPFR_FLAGS_DIVBY0";
    mpfr_flags[mpfr_flags["MPFR_FLAGS_ALL"] = 63] = "MPFR_FLAGS_ALL";
})(mpfr_flags || (mpfr_flags = {}));
var mpfr_free_cache_t;
(function (mpfr_free_cache_t) {
    mpfr_free_cache_t[mpfr_free_cache_t["MPFR_FREE_LOCAL_CACHE"] = 1] = "MPFR_FREE_LOCAL_CACHE";
    mpfr_free_cache_t[mpfr_free_cache_t["MPFR_FREE_GLOBAL_CACHE"] = 2] = "MPFR_FREE_GLOBAL_CACHE"; /* 1 << 1 */
})(mpfr_free_cache_t || (mpfr_free_cache_t = {}));

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

export { DivMode, FloatRoundingMode, init, mpfr_flags, mpfr_free_cache_t, mpfr_rnd_t, precisionToBits };
