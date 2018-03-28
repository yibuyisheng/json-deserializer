/**
 * @file utils
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser from './parsers/Parser';
import Validator from './validators/Validator';

export function isArray(val: any): boolean {
    return Array.isArray(val);
}

export function isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !isArray(val);
}

export function isJSONArray(val: any): boolean {
    return isArray(val);
}

export function isArrayConfig(val: any): boolean {
    return isArray(val);
}

export function isJSONObject(val: any): boolean {
    return isObject(val);
}

export function isObjectConfig(val: any): boolean {
    return isObject(val);
}

export function isParserConstructor(parser: any): boolean {
    if (!parser) {
        return false;
    }

    const proto = Object.getPrototypeOf(parser);
    return proto === Parser || proto instanceof Parser;
}

export function isParserConfig(config: any): boolean {
    return isObject(config) && isParserConstructor(config.parser);
}

export function isValidatorConstructor(validator: any): boolean {
    if (!validator) {
        return false;
    }

    const proto = Object.getPrototypeOf(validator);
    return proto === Validator || proto instanceof Validator;
}

export function isValidatorConfig(config: any): boolean {
    return isObject(config) && isValidatorConstructor(config.validator);
}
