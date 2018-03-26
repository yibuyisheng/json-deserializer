/**
 * @file deserialize
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {
    ConfigValue,
    IArrayConfig,
    IFieldParserConfig,
    IObjectConfig,
    IParserConstructor,
} from './config/DeserializeConfigTypes';
import {createError, ErrorCode} from './Error';
import {IJSONArray, IJSONObject, JSONValue} from './JSONTypes';
import {
    isArrayConfig,
    isJSONArray,
    isJSONObject,
    isObject,
    isObjectConfig,
    isParserConfig,
    isParserConstructor,
} from './utils';
import DeserializerConfig from './config/DeserializerConfig';

function stringifyConfig(config: any): string {
    if (config instanceof Array) {
        const output: string[] = [];
        config.reduce((prev, cur) => {
            prev.push(stringifyConfig(cur));
            return prev;
        }, output);
        return `[${output.join(', ')}]`;
    }

    if (isObject(config)) {
        const output: string[] = [];
        /* tslint:disable forin */
        for (const key in config) {
        /* tslint:enable forin */
            output.push(`${key}: ${stringifyConfig(config[key])}`);
        }
        return `{${output.join(', ')}}`;
    }

    if (isParserConstructor(config)) {
        return config.toString();
    }

    return JSON.stringify(config);
}

class Deserializer {
    private config: DeserializerConfig;

    public constructor(config: ConfigValue) {
        this.config = new DeserializerConfig(config);
    }

    public run(jsonObject: JSONValue) {
        return this.deserialize(jsonObject, this.config.config);
    }

    /**
     * 反序列化入口函数。 config 中不能有循环引用。
     */
    private deserialize(
        jsonObject: JSONValue,
        config: ConfigValue,
    ): any {
        // config instanceof IFieldParserConfig
        if (isParserConfig(config)) {
            // 如果待转换的值是一个数组，就对数组里面的值依次使用 config 中的 parser 进行转换。
            if (isJSONArray(jsonObject)) {
                return this.deserializeArray(jsonObject as IJSONArray, config as IArrayConfig);
            }

            const ParserClass = (config as IFieldParserConfig).parser;
            const parser = new ParserClass(config);
            return parser.parse(jsonObject);
        }

        // config instanceof IArrayConfig
        if (isArrayConfig(config)) {
            if (isJSONArray(jsonObject)) {
                return this.deserializeArray(jsonObject as IJSONArray, config as IArrayConfig);
            }

            throw createError(
                ErrorCode.ERR_SCHEMA_NOT_MATCH,
                `Not match: [val] ${JSON.stringify(jsonObject)} [config] ${stringifyConfig(config)}`,
                {config, val: jsonObject},
            );
        }

        if (this.config.isUpper(config)) {
            if (jsonObject !== undefined) {
                const upperConfig = this.config.upConfig(config);
                if (!upperConfig) {
                    throw new Error(`Wrong up config: ${upperConfig}.`);
                }
                return this.deserialize(jsonObject, upperConfig);
            }
            return;
        }

        // config instanceof IObjectConfig
        if (isObjectConfig(config)) {
            if (isJSONObject(jsonObject)) {
                return this.deserializeObject(jsonObject as IJSONObject, config as IObjectConfig);
            }
        }

        throw createError(
            ErrorCode.ERR_SCHEMA_NOT_MATCH,
            `Not match: [val] ${JSON.stringify(jsonObject)} [config] ${stringifyConfig(config)}`,
            {config, val: jsonObject},
        );
    }

    private deserializeArray(
        jsonArray: IJSONArray,
        config: IArrayConfig | IFieldParserConfig,
    ): any[] {
        const result: any[] = [];

        // config instanceof IArrayConfig
        if (isArrayConfig(config)) {
            const cfg = config as IArrayConfig;

            let lastParserConfig: any;
            jsonArray.reduce((prev, val, index) => {
                const parserConfig = cfg[index];
                if (parserConfig) {
                    result[index] = this.deserialize(val, parserConfig);
                }
                // 配置的 parser 数量少于待转换的数据量，就直接用之前的 parser 来转换剩下的元素
                else if (lastParserConfig) {
                    // 预先检查前面的 parser 是否能够应用到当前 JSON 数据的转换，如果不能，就直接放弃了，而不是抛出“不匹配”的错误。
                    const isMatch: boolean =
                        // **注意：**在 JSON 里面没有 undefined ，所以遇到 undefined ，其实就是在原 JSON 数据里面不存在。
                        // 如果 lastParserConfig 是一个展开的 parser 配置（ {parser: ParserClass } ），那么只要当前元素存在就可以转换。
                        (isParserConfig(lastParserConfig) && val !== undefined)
                        // 如果 lastParserConfig 是一个数组，那么只要 val 也是数组就可以转换。
                        || (isArrayConfig(lastParserConfig) && isJSONArray(val))
                        // 如果 lastParserConfig 是一个对象配置，那么只要 val 也对应是对象，就可以转换。
                        || (isObjectConfig(lastParserConfig) && isJSONObject(val));

                    if (isMatch) {
                        const ret = this.deserialize(val, lastParserConfig);
                        if (ret !== undefined) {
                            result[index] = ret;
                        }
                    }
                }

                if (parserConfig) {
                    lastParserConfig = parserConfig;
                }

                return prev;
            }, result);
        }
        // config instanceof IFieldParserConfig
        else {
            const parser = new ((config as IFieldParserConfig).parser as IParserConstructor)(config);
            const arr = jsonArray as JSONValue[];
            arr.reduce((prev, val, index) => {
                prev[index] = parser.parse(val);
                return prev;
            }, result);
        }

        return result;
    }

    private deserializeObject(jsonObject: IJSONObject, config: IObjectConfig): {[key: string]: any} {
        const result: {[key: string]: any} = {};

        /* tslint:disable forin */
        for (const field in config) {
        /* tslint:enable forin */
            const parserConfig = config[field];
            result[field] = this.deserialize(jsonObject[field], parserConfig);
        }

        return result;
    }
}

export default function deserializer(
    jsonObject: JSONValue,
    config: ConfigValue,
): any {
    return new Deserializer(config).run(jsonObject);
}
