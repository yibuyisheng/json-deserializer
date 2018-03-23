/**
 * @file Parser
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {createError, ErrorCode} from './Error';

export interface IOption {
    isRequired?: boolean;
}

/**
 * 对某一个属性值进行转换的转换器
 */
export default abstract class Parser {
    /**
     * 该属性值是否是必须的。
     *
     * @protected
     * @type {boolean}
     */
    protected isRequired: boolean;

    /**
     * 构造函数
     * @param {boolean} isRequired 是否必须。
     */
    public constructor(options: IOption = {}) {
        this.isRequired = options.isRequired || false;
    }

    /**
     * 转换方法。
     *
     * @public
     * @param {I} input 待转换的值
     * @return {O}
     */
    public abstract parse(input: any): any;

    protected checkEmpty(input: any): void {
        if (this.isRequired && this.isEmpty(input)) {
            throw createError(ErrorCode.ERR_REQUIRED);
        }
    }

    /**
     * 判断是否为空（ null 或者 undefined ）
     *
     * @param {any} val 待判断的值
     * @return {boolean}
     */
    protected isEmpty(val: any): boolean {
        return val == null;
    }
}
