/**
 * @file Validator
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import {createError, ErrorCode} from '../Error';
import {KeyPath} from '../validate';

export interface IValidatorOption {
    isRequired: boolean;
}

export interface IValidateError {
    keyPath: KeyPath;
    message: string;
    detail: any;
}

export type ValidateResult<E extends IValidateError> = true | E;

export default abstract class Validator<I, FI> {
    /**
     * 该属性值是否是必须的。
     *
     * @protected
     * @type {boolean}
     */
    protected isRequired: boolean;

    /**
     * @override
     */
    public static toString() {
        return `${this.name}{}`;
    }

    /**
     * 构造函数
     * @param {boolean} isRequired 是否必须。
     */
    public constructor(options: Partial<IValidatorOption> = {}) {
        this.isRequired = options.isRequired || false;
    }

    /**
     * 转换方法。
     *
     * @public
     * @param {I} input 待验证的值
     * @param {KeyPath} keyPath key path
     * @param {FI} fullInput 完整输入数据
     * @return {ValidateResult}
     */
    public abstract validate(
        input: I,
        keyPath: KeyPath,
        fullInput: FI,
    ): ValidateResult<IValidateError>;

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
    protected isEmpty<T>(val: T): boolean {
        return val == null || (typeof val === 'string' && val === '') || (Array.isArray(val) && !val.length);
    }
}
