/**
 * @file VEUIRulesValidators
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Validator, {ValidateResult, IValidatorOption, IValidateError} from './Validator';
import rule, {VEUIValidateResult} from 'veui/managers/rule';
import {KeyPath} from '../validate';

export interface IVEUIRulesValidatorOption extends IValidatorOption {
    rules: string | Array<{name: string;}>;
}

export interface IVEUIRuleValidateError extends IValidateError {
    detail: VEUIValidateResult;
}

export default class VEUIRulesValidator extends Validator {
    private rules: Array<{name: string;}>;

    public constructor(option: Partial<IVEUIRulesValidatorOption> = {}) {
        super(option);

        if (option.rules === undefined) {
            this.rules = [];
        } else if (typeof option.rules === 'string') {
            this.rules = [{name: option.rules}];
        } else {
            this.rules = option.rules;
        }
    }

    public validate(
        input: any,
        keyPath: KeyPath,
        _: any,
    ): ValidateResult<IVEUIRuleValidateError> {
        const ret = rule.validate(input, this.rules);
        if (ret === true) {
            return true;
        }

        return {
            message: 'Validate fail with VEUI rules.',
            detail: ret,
            keyPath: keyPath,
        };
    }
}
