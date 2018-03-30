/**
 * @file 将特定字符分割的字符串转换成字符串数组，比如：'1,2,3' -> [1,2,3]
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser, {IParserOption} from './Parser';

export interface ISeparateArrayOption extends IParserOption {
    separator?: RegExp;
    noEmpty?: boolean;
}

export default class SeparateArrayParser<T> extends Parser<T, string[] | undefined> {
    /**
     * 分割器
     *
     * @private
     * @type {RegExp}
     */
    private separator: RegExp;

    /**
     * 最后得到的数组是否能包含空字符串
     *
     * @private
     * @type {boolean}
     */
    private noEmpty: boolean;

    /**
     * @override
     */
    public constructor(options: ISeparateArrayOption = {}) {
        super(options);

        this.separator = options.separator || new RegExp('/,/');
        this.noEmpty = options.noEmpty || true;
    }

    /**
     * @override
     */
    public parse(input: T): string[] | undefined {
        this.checkEmpty(input);
        if (input === undefined) {
            return undefined;
        }

        const result = ('' + input).split(this.separator);
        return this.noEmpty ? result.filter((i) => !!i) : result;
    }
}
