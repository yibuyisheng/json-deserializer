import Parser, {IOption} from './Parser';

export interface IParserConstructor {
    new (options?: IOption | Record<string, any>): Parser;
}

export interface IArrayConfig extends Array<ConfigValue> {
    [field: number]: ConfigValue;
}

export interface IFieldParserConfig {
    parser: IParserConstructor;
    from?: string;
    [key: string]: any;
}

export interface IObjectConfig {
    [field: string]: IParserConstructor | IFieldParserConfig | IArrayConfig | IObjectConfig;
}

export type ConfigValue = IParserConstructor | IFieldParserConfig | IArrayConfig | IObjectConfig;
