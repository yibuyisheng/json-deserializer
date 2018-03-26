import DeserializerConfig from '../config/DeserializerConfig';
import NumberParser from '../parsers/NumberParser';

describe('DeserializerConfig', () => {
    it('should normalize basic config.', () => {
        const config = new DeserializerConfig(NumberParser);
        expect(config.config.parser).toBe(NumberParser);
    });

    it('should normalize basic object parser config.', () => {
        const config = new DeserializerConfig({parser: NumberParser});
        expect(config.config.parser).toBe(NumberParser);
    });

    it('should normalize basic array config.', () => {
        const config = new DeserializerConfig([NumberParser]);
        expect(config.config[0].parser).toEqual(NumberParser);
    });

    it('should normalize object config nested in array config.', () => {
        const config = new DeserializerConfig([
            {parser: NumberParser},
            {age: NumberParser},
            {age: {parser: NumberParser}},
        ]);
        expect(config.config[0].parser).toBe(NumberParser);
        expect(config.config[1].age.parser).toBe(NumberParser);
        expect(config.config[2].age.parser).toBe(NumberParser);
    });

    it('should normalize array config nested in object config.', () => {
        const config = new DeserializerConfig({
            age: [NumberParser, {parser: NumberParser}],
        });
        expect(config.config.age[0].parser).toBe(NumberParser);
        expect(config.config.age[1].parser).toBe(NumberParser);
    });

    it('should save the parent reference.', () => {
        const config = new DeserializerConfig([{age: NumberParser}]);
        expect(config.up(config.config[0].age, 1)).toMatchObject({age: {parser: NumberParser}});
        expect(config.up(config.config[0], 1)).toMatchObject([{age: {parser: NumberParser}}]);
        expect(config.up(config.config[0].age, 2)).toBe(config.up(config.config[0], 1));
    });
});
