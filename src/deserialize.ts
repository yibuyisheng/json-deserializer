/**
 * @file deserialize
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {ConfigValue, IArrayConfig, IFieldParserConfig, IObjectConfig, IParserConstructor} from './ConfigTypes';
import {createError, ErrorCode} from './Error';
import {IJSONArray, IJSONObject, JSONValue} from './JSONTypes';
import Parser from './Parser';

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

function isArray(val: any): boolean {
    return Object.prototype.toString.call(val) === '[object Array]';
}

function isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !isArray(val);
}

function isJSONArray(val: any): boolean {
    return isArray(val);
}

function isArrayConfig(val: any): boolean {
    return isArray(val);
}

function isJSONObject(val: any): boolean {
    return isObject(val);
}

function isObjectConfig(val: any): boolean {
    return isObject(val);
}

function isParserConstructor(parser: any): boolean {
    if (!parser) {
        return false;
    }

    const proto = Object.getPrototypeOf(parser);
    return proto === Parser || proto instanceof Parser;
}

function isParserConfig(config: any): boolean {
    return isObject(config) && isParserConstructor(config.parser);
}

function deserializeArray(
    jsonArray: IJSONArray,
    config: IParserConstructor | IArrayConfig | IFieldParserConfig,
): any[] {
    const result: any[] = [];

    // config instanceof IParserConstructor
    if (isParserConstructor(config)) {
        const ParserClass = config as IParserConstructor;
        const parser = new ParserClass();
        jsonArray.reduce((prev, val, index) => {
            prev[index] = parser.parse(val);
            return prev;
        }, result);
    }
    // config instanceof IArrayConfig
    else if (isArrayConfig(config)) {
        const cfg = config as IArrayConfig;

        let lastParserConfig: any;
        jsonArray.reduce((prev, val, index) => {
            const parserConfig = cfg[index];
            if (parserConfig) {
                result[index] = deserialize(val, parserConfig);
            }
            // 配置的 parser 数量少于待转换的数据量，就直接用之前的 parser 来转换剩下的元素
            else if (lastParserConfig) {
                // 预先检查前面的 parser 是否能够应用到当前 JSON 数据的转换，如果不能，就直接放弃了，而不是抛出“不匹配”的错误。
                const isMatch: boolean =
                    // 如果 lastParserConfig 直接就是 Parser 类，那么只要当前元素存在就可以转换。
                    // **注意：**在 JSON 里面没有 undefined ，所以遇到 undefined ，其实就是在原 JSON 数据里面不存在。
                    (isParserConstructor(lastParserConfig) && val !== undefined)
                    // 如果 lastParserConfig 是一个展开的 parser 配置（ {parser: ParserClass } ），那么只要当前元素存在就可以转换。
                    || (isParserConfig(lastParserConfig) && val !== undefined)
                    // 如果 lastParserConfig 是一个数组，那么只要 val 也是数组就可以转换。
                    || (isArrayConfig(lastParserConfig) && isJSONArray(val))
                    // 如果 lastParserConfig 是一个对象配置，那么只要 val 也对应是对象，就可以转换。
                    || (isObjectConfig(lastParserConfig) && isJSONObject(val));

                if (isMatch) {
                    const ret = deserialize(val, lastParserConfig);
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

function deserializeObject(jsonObject: IJSONObject, config: IObjectConfig): {[key: string]: any} {
    const result: {[key: string]: any} = {};

    /* tslint:disable forin */
    for (const field in config) {
    /* tslint:enable forin */
        const parserConfig = config[field];
        result[field] = deserialize(jsonObject[field], parserConfig);
    }

    return result;
}

/**
 * 反序列化入口函数。
 */
export default function deserialize(
    jsonObject: JSONValue,
    config: ConfigValue,
): any {
    // config instanceof IParserConstructor
    if (isParserConstructor(config)) {
        // 如果待转换的值是一个数组，就对数组里面的值依次使用 config parser 转换。
        if (isJSONArray(jsonObject)) {
            return deserializeArray(jsonObject as IJSONArray, config);
        }

        const ParserClass = config as IParserConstructor;
        const parser = new ParserClass();
        return parser.parse(jsonObject);
    }

    // config instanceof IFieldParserConfig
    if (isParserConfig(config)) {
        // 如果待转换的值是一个数组，就对数组里面的值依次使用 config 中的 parser 进行转换。
        if (isJSONArray(jsonObject)) {
            return deserializeArray(jsonObject as IJSONArray, config);
        }

        const ParserClass = (config as IFieldParserConfig).parser;
        const parser = new ParserClass(config);
        return parser.parse(jsonObject);
    }

    // config instanceof IArrayConfig
    if (isArrayConfig(config)) {
        if (isJSONArray(jsonObject)) {
            return deserializeArray(jsonObject as IJSONArray, config);
        }

        throw createError(
            ErrorCode.ERR_SCHEMA_NOT_MATCH,
            `Not match: [val] ${JSON.stringify(jsonObject)} [config] ${stringifyConfig(config)}`,
            {config, val: jsonObject},
        );
    }

    // config instanceof IObjectConfig
    if (isJSONObject(jsonObject)) {
        return deserializeObject(jsonObject as IJSONObject, config as IObjectConfig);
    }

    throw createError(
        ErrorCode.ERR_SCHEMA_NOT_MATCH,
        `Not match: [val] ${JSON.stringify(jsonObject)} [config] ${stringifyConfig(config)}`,
        {config, val: jsonObject},
    );
}
