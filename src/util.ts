export function isUint32(num: number) {
  return Number.isSafeInteger(num) && num >= 0 && num < Math.pow(2, 32);
}

export function assertUint32(num: number) {
  if (!isUint32(num)) {
    throw new Error("Invalid number specified: uint32_t is required");
  }
}

export function isInt32(num: number) {
  return (
    Number.isSafeInteger(num) &&
    num >= -Math.pow(2, 31) &&
    num < Math.pow(2, 31)
  );
}

export function assertInt32(num: number) {
  if (!isInt32(num)) {
    throw new Error("Invalid number specified: int32_t is required");
  }
}

export function assertArray(arr: any[]) {
  if (!Array.isArray(arr)) {
    throw new Error("Invalid parameter specified. Array is required!");
  }
}

export function isValidRadix(radix: number) {
  return Number.isSafeInteger(radix) && radix >= 2 && radix <= 36;
}

export function assertValidRadix(radix: number) {
  if (!isValidRadix(radix)) {
    throw new Error("radix must have a value between 2 and 36");
  }
}

export const FLOAT_SPECIAL_VALUES = {
  "@NaN@": "NaN",
  "@Inf@": "Infinity",
  "-@Inf@": "-Infinity",
} as const;

export const FLOAT_SPECIAL_VALUE_KEYS = Object.keys(FLOAT_SPECIAL_VALUES);

export const trimTrailingZeros = (num: string): string => {
  if (num.indexOf('.') === -1) return num;

  let pos = num.length - 1;
  while (pos >= 0) {
    if (num[pos] === ".") {
      pos--;
      break;
    } else if (num[pos] === "0") {
      pos--;
    } else {
      break;
    }
  }

  const rem = num.slice(0, pos + 1);

  if (rem === "-") {
    return "-0";
  } else if (rem.length === 0) {
    return "0";
  }

  return rem;
};

export const insertDecimalPoint = (
  mantissa: string,
  pointPos: number
): string => {
  const isNegative = mantissa.startsWith("-");

  const mantissaWithoutSign = isNegative ? mantissa.slice(1) : mantissa;
  const sign = isNegative ? "-" : "";
  let hasDecimalPoint = false;

  if (pointPos <= 0) {
    const zeros = "0".repeat(-pointPos);
    mantissa = `${sign}0.${zeros}${mantissaWithoutSign}`;
    hasDecimalPoint = true;
  } else if (pointPos < mantissaWithoutSign.length) {
    mantissa = `${sign}${mantissaWithoutSign.slice(
      0,
      pointPos
    )}.${mantissaWithoutSign.slice(pointPos)}`;
    hasDecimalPoint = true;
  } else {
    const zeros = "0".repeat(pointPos - mantissaWithoutSign.length);
    mantissa = `${mantissa}${zeros}`;
  }

  // trim trailing zeros after decimal point
  if (hasDecimalPoint) {
    mantissa = trimTrailingZeros(mantissa);
  }
  return mantissa;
};
