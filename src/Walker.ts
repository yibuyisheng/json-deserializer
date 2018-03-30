/**
 * @file Walker
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Config, {IObject} from './config/Config';
import {isArray, isObject} from './utils';
import {createError, ErrorCode} from './Error';
import {KeyPath} from './validate';

export interface IResult<R> {
    shouldBreak: boolean;
    result?: R;
}

export interface IWalkerOption {
    noCircular: boolean;

    /**
     * 是否优先根据输入的数据结构来遍历
     *
     * @type {boolean}
     */
    inputFirst: boolean;
}

export interface IHandled {
    input: any;
    result: any;
}

export default abstract class Walker<C extends Config> {

    private config: C;

    protected shouldIgnoreUndefined: boolean = true;

    protected keyPath: KeyPath = [];

    protected option: IWalkerOption;

    protected handledInputs: IHandled[] = [];

    protected originInput: any;

    public constructor(ConfigType: new (cfg: any) => C, config: any, option: Partial<IWalkerOption> = {}) {
        this.config = new ConfigType(config);
        this.option = {
            noCircular: true,
            inputFirst: true,
            ...option,
        };
    }

    public run(input: any): any {
        this.originInput = input;
        const result = this.walk(input, this.config.config).result;
        return result;
    }

    // config 只能是一个配置节点，类似于`{parser: NumberParser}`
    protected abstract handleLeaf(input: any, config: IObject): IResult<any>;

    protected abstract isMatchConfig(input: any, config: any): boolean;

    private findHandled(input: any): IHandled | undefined {
        let ret: IHandled | undefined;
        this.handledInputs.some((item) => {
            if (input === item.input) {
                ret = item;
                return true;
            }
            return false;
        });
        return ret;
    }

    protected walk(input: any, config: any): IResult<any> {
        if (isObject(input) || isArray(input)) {
            const prevHandled = this.findHandled(input);
            if (prevHandled) {
                if (this.option.noCircular) {
                    throw createError(ErrorCode.ERR_CIRCULAR_OBJECT, 'Circular object');
                }
                return {
                    shouldBreak: false,
                    result: prevHandled.result,
                };
            }
        }

        if (this.isLeafConfig(config)) {
            if (isArray(input)) {
                const handled = {input, result: []};
                this.handledInputs.push(handled);

                const ret = this.walkArray(input, config, handled.result);
                return ret;
            }

            return this.handleLeaf(input, config);
        }

        if (isArray(config)) {
            if (isArray(input)) {
                const handled = {input, result: []};
                this.handledInputs.push(handled);

                const ret = this.walkArray(input, config, handled.result);
                return ret;
            }

            throw createError(
                ErrorCode.ERR_SCHEMA_NOT_MATCH,
                `Not match: [val] ${JSON.stringify(input)} [config] ${this.config.stringifyConfig(config)}`,
                {config, val: input},
            );
        }

        if (this.config.isUpper(config)) {
            const upperConfig = this.config.upConfig(config);
            if (!upperConfig) {
                throw createError(ErrorCode.ERR_WRONG_UP_CONFIG, `Wrong up config: ${upperConfig}.`);
            }

            if (this.isMatchConfig(input, upperConfig)) {
                return this.walk(input, upperConfig);
            }
        }

        if (isObject(config) && isObject(input)) {
            const handled = {input, result: {}};
            this.handledInputs.push(handled);

            const ret = this.walkObject(input, config, handled.result);
            return ret;
        }

        throw createError(
            ErrorCode.ERR_SCHEMA_NOT_MATCH,
            `Not match: [val] ${JSON.stringify(input)} [config] ${this.config.stringifyConfig(config)}`,
            {config, val: input},
        );
    }

    private walkObject(input: IObject, config: IObject, result: IObject): IResult<IObject> {
        this.keyPath.push('');

        /* tslint:disable forin */
        for (const field in config) {
        /* tslint:enable forin */
            const fieldConfig = config[field];
            if (this.option.inputFirst && !(field in input)) {
                continue;
            }

            this.keyPath[this.keyPath.length - 1] = field;
            const ret = this.walk(input[field], fieldConfig);
            if (ret.shouldBreak) {
                return {shouldBreak: true, result: {...result, [field]: ret.result}};
            }
            result[field] = ret.result;
        }

        this.keyPath.pop();

        return {
            result,
            shouldBreak: false,
        };
    }

    // config 要么是一个配置节点，类似于`{parser: NumberParser}`，要么是一个数组。
    private walkArray(input: any[], config: any, result: any[]): IResult<any[]> {
        if (isArray(config)) {
            this.keyPath.push(-1);

            let lastConfig: any;
            let lastResult: any;
            const shouldBreak = input.some((val, index) => {
                const itemConfig = config[index];
                if (itemConfig) {
                    this.keyPath[this.keyPath.length - 1] = index;
                    const ret = this.walk(val, itemConfig);
                    if (ret.shouldBreak) {
                        lastResult = ret.result;
                        return true;
                    }
                    result[index] = ret.result;
                }
                // 配置节点数量少于输入数据量，就直接用之前的配置节点来处理剩下的元素
                else if (lastConfig) {
                    // 预先检查前面的配置节点是否能够应用到当前数据的处理，如果不能，就直接放弃了，而不是抛出“不匹配”的错误。
                    const isMatch: boolean = this.isMatchConfig(val, lastConfig);

                    if (isMatch) {
                        this.keyPath[this.keyPath.length - 1] = index;
                        const ret = this.walk(val, lastConfig);
                        if (ret.shouldBreak) {
                            lastResult = ret.result;
                            return true;
                        }
                        if (!this.shouldIgnoreUndefined || ret.result !== undefined) {
                            result[index] = ret.result;
                        }
                    }
                }

                if (itemConfig) {
                    lastConfig = itemConfig;
                }

                return false;
            });

            this.keyPath.pop();

            if (shouldBreak) {
                return {shouldBreak, result: [...result, lastResult]};
            }
        }
        // 对应一个配置节点
        else {
            let lastResult: any;
            this.keyPath.push(-1);
            const shouldBreak = input.some((val, index) => {
                this.keyPath[this.keyPath.length - 1] = index;
                const ret = this.walk(val, config);
                if (ret.shouldBreak) {
                    lastResult = ret.result;
                    return true;
                }
                result[index] = ret.result;
                return false;
            }, result);
            this.keyPath.pop();

            if (shouldBreak) {
                return {shouldBreak, result: [...result, lastResult]};
            }
        }

        return {
            shouldBreak: false,
            result,
        };
    }

    protected isLeafConfig(itemConfig: {[key: string]: any}): boolean {
        return this.config.isLeaf(itemConfig);
    }
}
