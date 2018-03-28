/**
 * @file BooleanParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './Parser';

/**
 * 字符串转换器
 */
export default class BooleanParser extends Parser {
    /**
     * @override
     */
    public parse(input: any): boolean | undefined {
        return input === undefined ? undefined : !!input;
    }
}
