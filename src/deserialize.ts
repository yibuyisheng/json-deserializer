/**
 * @file deserialize
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {
    ConfigValue,
    IFieldParserConfig,
} from './config/DeserializeConfigTypes';
import {JSONValue} from './JSONTypes';
import {
    isArrayConfig,
    isJSONArray,
    isJSONObject,
    isObjectConfig,
    isParserConfig,
} from './utils';
import DeserializerConfig from './config/DeserializerConfig';
import Walker, {IResult} from './Walker';

class Deserializer extends Walker<DeserializerConfig> {

    public constructor(config: any) {
        super(DeserializerConfig, config);
    }

    protected handleLeaf(input: any, config: IFieldParserConfig): IResult<any> {
        const ParserClass = (config as IFieldParserConfig).parser;
        const parser = new ParserClass(config);
        return {
            result: parser.parse(input),
            shouldBreak: false,
        };
    }

    protected isMatchConfig(input: any, config: any): boolean {
        // 预先检查前面的 parser 是否能够应用到当前 JSON 数据的转换，如果不能，就直接放弃了，而不是抛出“不匹配”的错误。
        const isMatch: boolean =
            // **注意：**在 JSON 里面没有 undefined ，所以遇到 undefined ，其实就是在原 JSON 数据里面不存在。
            // 如果 lastParserConfig 是一个展开的 parser 配置（ {parser: ParserClass } ），那么只要当前元素存在就可以转换。
            (isParserConfig(config) && input !== undefined)
            // 如果 lastParserConfig 是一个数组，那么只要 input 也是数组就可以转换。
            || (isArrayConfig(config) && isJSONArray(input))
            // 如果 lastParserConfig 是一个对象配置，那么只要 input 也对应是对象，就可以转换。
            || (isObjectConfig(config) && isJSONObject(input));
        return isMatch;
    }
}

export default function deserializer(
    jsonObject: JSONValue,
    config: ConfigValue,
): any {
    return new Deserializer(config).run(jsonObject);
}
