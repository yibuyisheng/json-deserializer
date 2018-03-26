/**
 * @file NumberParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {createError, ErrorCode} from '../Error';
import Parser, {IOption} from './Parser';

export interface INumberOption extends IOption {
    isInt?: boolean;
    radix?: 10;
}

/**
 * 数字转换器
 */
export default class NumberParser extends Parser {
    /**
     * 是否使用 parseInt 来转换
     *
     * @private
     * @type {boolean}
     */
    private isInt: boolean;

    /**
     * 使用 parseInt 转换时的 radix ，范围是 [2,36]
     *
     * @private
     * @type {number}
     */
    private radix: number;

    /**
     * @override
     */
    public constructor(options: INumberOption = {}) {
        super(options);

        this.isInt = options.isInt || false;

        this.radix = options.radix || 10;
        if (this.radix < 2 && this.radix > 36) {
            throw createError(ErrorCode.ERR_RADIX);
        }
    }

    /**
     * @override
     */
    public parse(input: any): number | undefined {
        this.checkEmpty(input);
        if (input === undefined) {
            return undefined;
        }

        const result = this.isInt ? parseInt(input, this.radix) : parseFloat(input);
        if (isNaN(result)) {
            throw createError(ErrorCode.ERR_NUMBER_FORMAT);
        }
        return result;
    }
}
