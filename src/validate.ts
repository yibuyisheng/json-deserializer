import Walker, {IResult, IWalkerOption} from './Walker';
import ValidatorConfig from './config/ValidatorConfig';
import {IFieldValidatorConfig} from './config/ValidatorConfigTypes';
import {isValidatorConfig, isArray, isObject} from './utils';
import {ValidateResult, IValidateError} from './validators/Validator';

export interface IValidatorControllerOption extends IWalkerOption {
    all: boolean;
    flattenResult: boolean;
}

export type KeyPath = Array<string | number>;
export type FlattenResult = Array<{keyPath: KeyPath, result: ValidateResult<IValidateError>}>;

class ValidatorController extends Walker<ValidatorConfig> {
    private flattenResult: FlattenResult = [];

    protected option: IValidatorControllerOption;

    public constructor(config: any, option: Partial<IValidatorControllerOption> = {}) {
        super(ValidatorConfig, config, option);

        this.option = {
            all: false,
            flattenResult: false,
            noCircular: false,
            ...option,
        };
    }

    public run(input: any): any {
        const result = super.run(input);

        if (result === true) {
            return true;
        }

        if (this.option.flattenResult) {
            return this.flattenResult.length ? this.flattenResult : true;
        }

        return result;
    }

    protected handleLeaf(input: any, config: IFieldValidatorConfig): IResult<ValidateResult<IValidateError>> {
        const ValidatorClass = (config as IFieldValidatorConfig).validator;
        const validator = new ValidatorClass(config);
        const result = validator.validate(input, [...this.keyPath], this.originInput);

        if (this.option.flattenResult) {
            if (result !== true) {
                this.flattenResult.push({
                    keyPath: [...this.keyPath],
                    result,
                });
            }

            return !this.option.all && result !== true
                ? {result, shouldBreak: true}
                : {result, shouldBreak: false};
        }

        if (result !== true) {
            return {
                result,
                shouldBreak: !this.option.all,
            };
        }

        return {result: true, shouldBreak: false};
    }

    protected isMatchConfig(input: any, config: any): boolean {
        const isMatch: boolean = (isValidatorConfig(config) && input !== undefined)
            || (isArray(config) && isArray(input))
            || (isObject(config) && isObject(input));
        return isMatch;
    }
}

export default function validate(input: any, config: any, option?: Partial<IValidatorControllerOption>) {
    return new ValidatorController(config, option).run(input);
}
