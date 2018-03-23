import deserialize from '../deserialize';
import NumberParser from '../NumberParser';
import StringParser from '../StringParser';

function testEqual(jsonObject: any, schema: any, result: any) {
    expect(deserialize(jsonObject, schema)).toEqual(result);
}

describe('deserialize', () => {
    it('should handle basic convert.', () => {
        const jsonObject = {
            name: 'yibuyisheng',
            age: 20,
        };
        const schema = {
            name: StringParser,
            age: NumberParser,
        };
        testEqual(jsonObject, schema, {name: 'yibuyisheng', age: 20});
    });

    it('should convert number to string.', () => {
        const jsonObject = {
            name: 123,
        };
        const schema = {
            name: StringParser,
        };
        testEqual(jsonObject, schema, {name: '123'});
    });

    it('should handle Array.', () => {
        testEqual(['yibuyisheng', 20], [StringParser, NumberParser], ['yibuyisheng', 20]);
        testEqual({arr: ['yibuyisheng', 20]}, {arr: [StringParser, NumberParser]}, {arr: ['yibuyisheng', 20]});
    });

    it('should use the last parser to parse the rest elements in a array.', () => {
        const jsonObject = ['yibuyisheng', 20];
        const schema = [StringParser];
        testEqual(jsonObject, schema, ['yibuyisheng', '20']);
    });

    it('should support short config for array.', () => {
        testEqual(['yibuyisheng', 20], StringParser, ['yibuyisheng', '20']);
        testEqual({arr: ['yibuyisheng', 20]}, {arr: StringParser}, {arr: ['yibuyisheng', '20']});
    });

    it('should handle nested array.', () => {
        testEqual(
            ['yibuyisheng', 20, ['shanghai', '123']],
            [StringParser, NumberParser, StringParser],
            ['yibuyisheng', 20, ['shanghai', '123']],
        );
        testEqual(
            [['shanghai', '123'], 'yibuyisheng', 20],
            [StringParser],
            [['shanghai', '123'], 'yibuyisheng', '20'],
        );
        testEqual(
            [['shanghai', '123'], 'yibuyisheng', 20],
            [[StringParser]],
            [['shanghai', '123']],
        );
        testEqual(
            [['shanghai', '123'], 'yibuyisheng', 20],
            [[StringParser], StringParser],
            [['shanghai', '123'], 'yibuyisheng', '20'],
        );
        testEqual(
            ['yibuyisheng'],
            {parser: StringParser},
            ['yibuyisheng'],
        );
        testEqual(
            [['yibuyisheng']],
            [{parser: StringParser}],
            [['yibuyisheng']],
        );
    });

    it('should handle normalized parser config in array', () => {
        testEqual(
            ['yibuyisheng', 20],
            [{parser: StringParser}],
            ['yibuyisheng', '20'],
        );
    });

    it('should handle the object in array.', () => {
        testEqual(
            [{name: 'yibuyisheng', age: 20}],
            [{name: StringParser, age: NumberParser}],
            [{name: 'yibuyisheng', age: 20}],
        );
    });

    it('should handle array with short config.', () => {
        testEqual(
            ['yibuyisheng', 20],
            StringParser,
            ['yibuyisheng', '20'],
        );
        testEqual(
            ['yibuyisheng', 20],
            {parser: StringParser},
            ['yibuyisheng', '20'],
        );
        testEqual(
            {arr: ['yibuyisheng', 20]},
            {arr: {parser: StringParser}},
            {arr: ['yibuyisheng', '20']},
        );
    });

    it('should handle object with normalized config.', () => {
        testEqual(
            {name: 'yibuyisheng', age: 20},
            {age: {parser: StringParser}},
            {age: '20'},
        );
        testEqual(
            'yibuyisheng',
            {parser: StringParser},
            'yibuyisheng',
        );
    });

    it('should handle nested object.', () => {
        testEqual(
            {name: 'yibuyisheng', nested: {name: 'zhangsan', age: 10}},
            {nested: {name: StringParser}},
            {nested: {name: 'zhangsan'}},
        );
    });

    it('should handle basic value.', () => {
        testEqual(
            'yibuyisheng',
            StringParser,
            'yibuyisheng',
        );
    });

});
