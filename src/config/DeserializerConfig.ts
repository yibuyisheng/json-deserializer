/**
 * @file 经过 normalize 的配置
 * @author yibuyisheng(yibuyisheng@163.com)
 */
import Config from './Config';
import {ConfigValue, IFieldParserConfig, IParserConstructor} from './DeserializeConfigTypes';
import {isParserConfig, isParserConstructor} from '../utils';

export type ParserNode = IParserConstructor | IFieldParserConfig;

export default class DeserializerConfig extends Config {
    public isLeaf(item: ConfigValue): boolean {
        return isParserConstructor(item) || isParserConfig(item);
    }

    protected normalizeLeaf(value: ParserNode): IFieldParserConfig {
        return isParserConfig(value)
            ? {...value}
            : {parser: value};
    }
}
