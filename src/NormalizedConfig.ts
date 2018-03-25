/**
 * @file 经过 normalize 的配置
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {ConfigValue, IArrayConfig, IFieldParserConfig, IObjectConfig, IParserConstructor} from './ConfigTypes';
import {createError, ErrorCode} from './Error';
import Up from './Up';
import {isArrayConfig, isObjectConfig, isParserConfig, isParserConstructor} from './utils';

export type ParserNode = IParserConstructor | IFieldParserConfig;

const PARENT_KEY = typeof (window as any).Symbol === 'undefined' ? '__parent__' : Symbol('parent');

export default class NormalizedConfig {
    private config?: ConfigValue;

    private current?: ConfigValue = this.config;

    public setValue(value: ParserNode) {
        if (this.config) {
            throw createError(ErrorCode.ERR_CONFIG_END);
        }

        this.config = this.getNormalizedParserNode(value);
        this.current = this.config;
    }

    public addObjectConfig(key: string, value: ConfigValue) {
        if (!key) {
            throw createError(ErrorCode.ERR_CONFIG_EMPTY_KEY);
        }

        if (!this.current) {
            throw createError(ErrorCode.ERR_CONFIG_NOT_INITED);
        }

        if (this.isCurrentLeaf()) {
            throw createError(ErrorCode.ERR_CONFIG_ALREADY_END);
        }

        if (isArrayConfig(this.current)) {
            throw createError(ErrorCode.ERR_CONFIG_CURRENT_IS_NOT_OBJECT);
        }

        const current = this.current as IObjectConfig;

        if (current[key]) {
            throw createError(ErrorCode.ERR_CONFIG_KEY_EXISTS);
        }

        if (this.isParser(value)) {
            current[key] = this.getNormalizedParserNode(value as ParserNode);
        } else if (isArrayConfig(value)) {
            // 防止夹带私货
            if ((value as any[]).length) {
                throw new TypeError('Should use an empty Array to initialize the array config.');
            }

            const arr: IArrayConfig = [];
            (arr as any)[PARENT_KEY] = current;
            current[key] = arr;
            this.current = arr;
        } else {
            // 防止夹带私货
            if (Object.keys(value).length) {
                throw new TypeError('Should use an empty object to initialize the object config.');
            }

            const obj: IObjectConfig = {[PARENT_KEY]: current};
            current[key] = obj;
            this.current = obj;
        }
    }

    public addArrayConfig(value: ConfigValue) {
        if (!this.current) {
            throw createError(ErrorCode.ERR_CONFIG_NOT_INITED);
        }

        if (!isArrayConfig(this.current)) {
            throw createError(ErrorCode.ERR_CONFIG_CURRENT_NOT_ARRAY);
        }

        const current: IArrayConfig = this.current as IArrayConfig;
        if (this.isParser(value)) {
            current.push(this.getNormalizedParserNode(value as ParserNode));
        } else if (isArrayConfig(value)) {
            // 防止夹带私货
            if ((value as any[]).length) {
                throw new TypeError('Should use an empty Array to initialize the array config.');
            }

            const arr: IArrayConfig = [];
            (arr as any)[PARENT_KEY] = current;
            current.push(arr);
            this.current = arr;
        } else {
            // 防止夹带私货
            if (Object.keys(value).length) {
                throw new TypeError('Should use an empty object to initialize the object config.');
            }

            const obj: IObjectConfig = {[PARENT_KEY]: current};
            current.push(obj);
            this.current = obj;
        }
    }

    public up(upStep: Up) {
        const walkUp = (steps: number, current?: ConfigValue): ConfigValue => {
            if (!current) {
                throw new Error('Can not find such ancestor.');
            }

            if (steps === 0) {
                return current;
            }

            return walkUp(steps - 1, (current as any)[PARENT_KEY]);
        };
        return walkUp(upStep.step, this.current);
    }

    private isCurrentLeaf() {
        return this.isParser(this.current);
    }

    private isParser(value: any) {
        return isParserConstructor(value) || isParserConfig(value);
    }

    private getNormalizedParserNode(value: ParserNode): IFieldParserConfig {
        return isParserConfig(value)
            ? {...(value as IFieldParserConfig)}
            : {parser: value as IParserConstructor};
    }
}
