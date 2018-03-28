/**
 * @file ValidatorConfigTypes
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Validator, {IValidatorOption} from '../validators/Validator';

export interface IValidatorConstructor {
    new (options?: IValidatorOption | Record<string, any>): Validator;
}

export interface IArrayConfig extends Array<ConfigValue> {
    [field: number]: ConfigValue;
}

export interface IFieldValidatorConfig {
    validator: IValidatorConstructor;
    from?: string;
    [key: string]: any;
}

export interface IObjectConfig {
    [field: string]: IValidatorConstructor | IFieldValidatorConfig | IArrayConfig | IObjectConfig;
}

export type ConfigValue = IValidatorConstructor | IFieldValidatorConfig | IArrayConfig | IObjectConfig;
