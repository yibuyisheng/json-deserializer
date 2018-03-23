export enum ErrorCode {
    ERR_REQUIRED,
    // 经过 parseInt 或者 parseFloat 转换之后，结果是 NaN
    ERR_NUMBER_FORMAT,
    // parseInt 中的 radis 范围是 [2,36]
    ERR_RADIX,

    ERR_INVALID_DATE,

    ERR_SCHEMA_NOT_MATCH,
}

/**
 * 包一层，给 error 加上 code 。
 *
 * @param {ErrorCode} code
 * @param {string} message
 * @param {any} extra
 * @return {Error}
 */
export function createError(code: ErrorCode, message: string = 'Error.', extra: any = null): Error {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).extra = extra;
    return error;
}
