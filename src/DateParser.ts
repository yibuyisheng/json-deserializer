/**
 * @file DateParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import * as moment from 'moment';
import {createError, ErrorCode} from './Error';
import Parser, {IOption} from './Parser';

export interface IDateOption extends IOption {
    format?: string;
}

/**
 * 字符串转换器
 */
export default class DateParser extends Parser {

    /**
     * 输入日期的格式。
     *
     * @public
     * @type {string}
     */
    private format: string;

    /**
     * @override
     */
    public constructor(options: IDateOption = {}) {
        super(options);

        this.format = options.format || 'YYYYMMDDHHmmss';
    }

    /**
     * @override
     */
    public parse(input: any): Date | undefined {
        this.checkEmpty(input);
        if (input === undefined) {
            return undefined;
        }

        const result = moment('' + input, this.format);
        if (!result.isValid()) {
            throw createError(ErrorCode.ERR_INVALID_DATE, undefined, result);
        }
        return result.toDate();
    }
}
