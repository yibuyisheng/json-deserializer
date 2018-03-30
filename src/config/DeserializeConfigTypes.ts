/**
 * @file ConfigTypes
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Parser, {IParserOption} from '../parsers/Parser';

export interface IParserConstructor {
    new (options?: IParserOption | Record<string, any>): Parser;
}

export interface IArrayConfig extends Array<ConfigValue> {}

export interface IFieldParserConfig {
    parser: IParserConstructor;
    from?: string;
    [key: string]: any;
}

export interface IObjectConfig {
    [field: string]: IParserConstructor | IFieldParserConfig | IArrayConfig | IObjectConfig;
}

export type ConfigValue = IParserConstructor | IFieldParserConfig | IArrayConfig | IObjectConfig;
