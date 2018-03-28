/**
 * @file StringParser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './Parser';

/**
 * 字符串转换器
 */
export default class StringParser extends Parser {
    /**
     * @override
     */
    public parse(input: any): string | undefined {
        this.checkEmpty(input);
        if (input === undefined) {
            return undefined;
        }

        return '' + input;
    }
}
