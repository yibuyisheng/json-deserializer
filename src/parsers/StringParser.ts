/**
 * @file StringParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './Parser';

/**
 * 字符串转换器
 */
export default class StringParser<I> extends Parser<I, string | undefined> {
    /**
     * @override
     */
    public parse(input: I): string | undefined {
        this.checkEmpty(input);
        if (input === undefined) {
            return undefined;
        }

        return '' + input;
    }
}
