export declare function isUint32(num: number): boolean;
export declare function assertUint32(num: number): void;
export declare function isInt32(num: number): boolean;
export declare function assertInt32(num: number): void;
export declare function assertArray(arr: any[]): void;
export declare function isValidRadix(radix: number): boolean;
export declare function assertValidRadix(radix: number): void;
export declare const FLOAT_SPECIAL_VALUES: {
    readonly "@NaN@": "NaN";
    readonly "@Inf@": "Infinity";
    readonly "-@Inf@": "-Infinity";
};
export declare const FLOAT_SPECIAL_VALUE_KEYS: string[];
export declare const trimTrailingZeros: (num: string) => string;
export declare const insertDecimalPoint: (mantissa: string, pointPos: number) => string;
