/**
 * @file ValidatorConfig
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Config from './Config';
import {ConfigValue, IFieldValidatorConfig, IValidatorConstructor} from './ValidatorConfigTypes';
import {isValidatorConfig, isValidatorConstructor} from '../utils';

export type ValidatorNode = IValidatorConstructor | IFieldValidatorConfig;

export default class ValidatorConfig extends Config {
    public isLeaf(item: ConfigValue): boolean {
        return isValidatorConstructor(item) || isValidatorConfig(item);
    }

    protected normalizeLeaf(value: ValidatorNode): IFieldValidatorConfig {
        return isValidatorConfig(value)
            ? {...(value as IFieldValidatorConfig)}
            : {validator: value as IValidatorConstructor};
    }
}
