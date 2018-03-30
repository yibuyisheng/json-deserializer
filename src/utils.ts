/**
 * @file utils
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './parsers/Parser';
import Validator from './validators/Validator';
import {IJSONArray, IJSONObject} from './JSONTypes';
import {IArrayConfig, IParserConstructor, IFieldParserConfig} from './config/DeserializeConfigTypes';
import {IObjectConfig, IValidatorConstructor} from './config/ValidatorConfigTypes';
import ValidatorConfig from './config/ValidatorConfig';

export function isArray(val: any): val is any[] {
    return Array.isArray(val);
}

export function isObject(val: any): val is Record<string, any> {
    return val !== null && typeof val === 'object' && !isArray(val);
}

export function isJSONArray(val: any): val is IJSONArray {
    return isArray(val);
}

export function isArrayConfig(val: any): val is IArrayConfig {
    return isArray(val);
}

export function isJSONObject(val: any): val is IJSONObject {
    return isObject(val);
}

export function isObjectConfig(val: any): val is IObjectConfig {
    return isObject(val);
}

export function isParserConstructor(parser: any): parser is IParserConstructor {
    if (!parser) {
        return false;
    }

    const proto = Object.getPrototypeOf(parser);
    return proto === Parser || proto instanceof Parser;
}

export function isParserConfig(config: any): config is IFieldParserConfig {
    return isObject(config) && isParserConstructor(config.parser);
}

export function isValidatorConstructor(validator: any): validator is IValidatorConstructor {
    if (!validator) {
        return false;
    }

    const proto = Object.getPrototypeOf(validator);
    return proto === Validator || proto instanceof Validator;
}

export function isValidatorConfig(config: any): config is ValidatorConfig {
    return isObject(config) && isValidatorConstructor(config.validator);
}
