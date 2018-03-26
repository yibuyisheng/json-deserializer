import Config, {IObject} from './config/Config';
import {isArray, isObject} from './utils';
import {createError, ErrorCode} from './Error';

export default abstract class Walker<C extends Config> {

    private config: C;

    protected shouldIgnoreUndefined: boolean = true;

    public constructor(ConfigType: new (cfg: any) => C, config: any) {
        this.config = new ConfigType(config);
    }

    public run(input: any): any {
        return this.walk(input, this.config.config);
    }

    // config 只能是一个配置节点，类似于`{parser: NumberParser}`
    protected abstract handleLeaf(input: any, config: IObject): any;

    protected abstract isMatchConfig(input: any, config: any): boolean;

    protected walk(input: any, config: any): any {
        if (this.isLeafConfig(config)) {
            if (isArray(input)) {
                return this.walkArray(input as any[], config);
            }

            return this.handleLeaf(input, config);
        }

        if (isArray(config)) {
            if (isArray(input)) {
                return this.walkArray(input, config);
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
                throw new Error(`Wrong up config: ${upperConfig}.`);
            }

            if (this.isMatchConfig(input, upperConfig)) {
                return this.walk(input, upperConfig);
            }
        }

        if (isObject(config) && isObject(input)) {
            return this.walkObject(input, config);
        }

        throw createError(
            ErrorCode.ERR_SCHEMA_NOT_MATCH,
            `Not match: [val] ${JSON.stringify(input)} [config] ${this.config.stringifyConfig(config)}`,
            {config, val: input},
        );
    }

    private walkObject(input: IObject, config: IObject): IObject {
        const result: IObject = {};

        /* tslint:disable forin */
        for (const field in config) {
        /* tslint:enable forin */
            const fieldConfig = config[field];
            if (field in input) {
                result[field] = this.walk(input[field], fieldConfig);
            }
        }

        return result;
    }

    // config 要么是一个配置节点，类似于`{parser: NumberParser}`，要么是一个数组。
    private walkArray(input: any[], config: any): any[] {
        const result: any[] = [];

        if (isArray(config)) {
            const cfg = config as any[];

            let lastConfig: any;
            input.reduce((prev, val, index) => {
                const itemConfig = cfg[index];
                if (itemConfig) {
                    result[index] = this.walk(val, itemConfig);
                }
                // 配置节点数量少于输入数据量，就直接用之前的配置节点来处理剩下的元素
                else if (lastConfig) {
                    // 预先检查前面的配置节点是否能够应用到当前数据的处理，如果不能，就直接放弃了，而不是抛出“不匹配”的错误。
                    const isMatch: boolean = this.isMatchConfig(val, lastConfig);

                    if (isMatch) {
                        const ret = this.walk(val, lastConfig);
                        if (!this.shouldIgnoreUndefined || ret !== undefined) {
                            result[index] = ret;
                        }
                    }
                }

                if (itemConfig) {
                    lastConfig = itemConfig;
                }

                return prev;
            }, result);
        }
        // 对应一个配置节点
        else {
            input.reduce((prev, val, index) => {
                prev[index] = this.walk(val, config);
                return prev;
            }, result);
        }

        return result;
    }

    protected isLeafConfig(itemConfig: {[key: string]: any}): boolean {
        return this.config.isLeaf(itemConfig);
    }
}
