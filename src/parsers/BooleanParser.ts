/**
 * @file BooleanParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './Parser';

/**
 * 字符串转换器
 */
export default class BooleanParser<I> extends Parser<I, boolean | undefined> {
    /**
     * @override
     */
    public parse(input: I): boolean | undefined {
        return input === undefined ? undefined : !!input;
    }
}
