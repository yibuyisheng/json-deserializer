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
            // parserConfig instanceof IParserConstructor
            if (isParserConstructor(parserConfig)) {
                if (val instanceof Array) {
                    result[index] = deserializeArray(val, parserConfig);
                } else {
                    const parser = new (parserConfig as IParserConstructor)();
                    result[index] = parser.parse(val);
                }
            }
            // parserConfig instanceof IArrayConfig
            else if (parserConfig instanceof Array) {
                if (val && !(val instanceof Array)) {
                    throw createError(
                        ErrorCode.ERR_SCHEMA_NOT_MATCH,
                        `Not match: [val] ${JSON.stringify(val)} [config] ${stringifyConfig(parserConfig)}`,
                        {config: parserConfig, val},
                    );
                } else if (val) {
                    result[index] = deserializeArray(val as IJSONArray, parserConfig);
                }
            }
            // parserConfig instanceof IFieldParserConfig
            else if (isParserConfig(parserConfig)) {
                const parser = new ((parserConfig as IFieldParserConfig).parser)(parserConfig);
                result[index] = val instanceof Array ? deserializeArray(val, parserConfig) : parser.parse(val);
            }
            // 普通配置对象，继续往下解析
            else if (isObject(parserConfig)) {
                if (isObject(val)) {
                    result[index] = deserializeObject(val as IJSONObject, parserConfig);
                } else if (val !== undefined) {
                    throw createError(
                        ErrorCode.ERR_SCHEMA_NOT_MATCH,
                        `Not match: [val] ${JSON.stringify(val)} [config] ${stringifyConfig(parserConfig)}`,
                        {config: parserConfig, val},
                    );
                }
            }
            // 配置的 parser 数量少于待转换的数据量，就直接用之前的 parser 来转换剩下的元素
            else if (parserConfig === undefined && lastParserConfig) {
                const isMatch: boolean = (isParserConstructor(lastParserConfig) && val !== undefined)
                    || (isParserConfig(lastParserConfig) && val !== undefined)
                    || (lastParserConfig instanceof Array && val instanceof Array)
                    || (isObject(lastParserConfig) && isObject(val));

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

        // config instanceof IParserConstructor
        if (isParserConstructor(parserConfig)) {
            if (jsonObject[field] instanceof Array) {
                result[field] = deserializeArray(jsonObject[field] as IJSONArray, parserConfig);
            } else {
                const normalizedConfig = {
                    parser: parserConfig as IParserConstructor,
                    from: field,
                };
                const parser = new normalizedConfig.parser({isRequired: false, ...normalizedConfig});
                result[field] = parser.parse(jsonObject[normalizedConfig.from]);
            }
        }
        // config instanceof IFieldParserConfig
        else if (isParserConfig(parserConfig)) {
            const cfg = parserConfig as Partial<IFieldParserConfig>;
            const normalizedConfig = {
                ...cfg,
                parser: cfg.parser as IParserConstructor,
                from: cfg.from || field,
            };

            if (jsonObject[normalizedConfig.from] instanceof Array) {
                result[field] = deserializeArray(jsonObject[normalizedConfig.from] as IJSONArray, parserConfig);
            } else {
                const parser = new normalizedConfig.parser({isRequired: false, ...normalizedConfig});
                result[field] = parser.parse(jsonObject[normalizedConfig.from]);
            }
        }
        // config instanceof IArrayConfig
        else if (parserConfig instanceof Array) {
            if (jsonObject[field] instanceof Array) {
                result[field] = deserializeArray(jsonObject[field] as IJSONArray, parserConfig as IArrayConfig);
            } else if (jsonObject[field] !== undefined) {
                throw createError(
                    ErrorCode.ERR_SCHEMA_NOT_MATCH,
                    `Not match: [val] ${JSON.stringify(jsonObject[field])} [config] ${stringifyConfig(parserConfig)}`,
                    {config: parserConfig, val: jsonObject[field], field},
                );
            }
        }
        // config instanceof IObjectConfig
        else {
            if (isObject(jsonObject[field])) {
                result[field] = deserializeObject(jsonObject[field] as IJSONObject, parserConfig as IObjectConfig);
            } else if (jsonObject[field] !== undefined) {
                throw createError(
                    ErrorCode.ERR_SCHEMA_NOT_MATCH,
                    `Not match: [val] ${JSON.stringify(jsonObject[field])} [config] ${stringifyConfig(parserConfig)}`,
                    {config: parserConfig, val: jsonObject[field], field},
                );
            }
        }
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
