/**
 * @file Error
 * @author yibuyisheng(yibuyisheng@163.com)
 */
export enum ErrorCode {
    ERR_REQUIRED,
    // 经过 parseInt 或者 parseFloat 转换之后，结果是 NaN
    ERR_NUMBER_FORMAT,
    // parseInt 中的 radis 范围是 [2,36]
    ERR_RADIX,

    ERR_INVALID_DATE,

    ERR_SCHEMA_NOT_MATCH,

    ERR_CONFIG_END,

    ERR_CONFIG_NOT_INITED,

    ERR_CONFIG_ALREADY_END,

    ERR_CONFIG_CURRENT_IS_NOT_OBJECT,

    ERR_CONFIG_EMPTY_KEY,

    ERR_CONFIG_KEY_EXISTS,

    ERR_CONFIG_CURRENT_NOT_ARRAY,

    ERR_CIRCULAR_OBJECT,

    ERR_WRONG_UP_CONFIG,

    ERR_WRONG_CONFIG,
}

declare global {
    interface Error {
        code?: ErrorCode;
        extra?: any;
    }
}

/**
 * 包一层，给 error 加上 code 。
 *
 * @param {ErrorCode} code
 * @param {string} message
 * @param {T} extra
 * @return {Error}
 */
export function createError<T>(code: ErrorCode, message: string = 'Error.', extra?: T): Error {
    const error = new Error(message);
    error.code = code;
    error.extra = extra;
    return error;
}
