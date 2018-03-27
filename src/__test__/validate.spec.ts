import validate from '../validate';
import VEUIRulesValidator from '../validators/VEUIRulesValidator';

describe('validate', () => {
    it('should validate primary value.', () => {
        expect(validate('123', {
            validator: VEUIRulesValidator,
            rules: 'required'
        })).toBe(true);

        expect(validate(null, {validator: VEUIRulesValidator, rules: 'required'})).toEqual(
            {
                detail: [
                    {
                        message: '请填写',
                        name: 'required'
                    }
                ],
                keyPath: [],
                message: 'Validate fail with VEUI rules.',
            }
        );

        expect(validate(undefined, {validator: VEUIRulesValidator, rules: 'required'})).toEqual(
            {
                detail: [
                    {
                        message: '请填写',
                        name: 'required'
                    }
                ],
                keyPath: [],
                message: 'Validate fail with VEUI rules.',
            }
        );
    });

    it('should handle circular object.', () => {
        const obj1: Record<string, any> = {};
        const obj2: Record<string, any> = {};

        obj1.name = 'zhangsan';
        obj2.name = 'lisi';

        obj1.child = obj2;
        obj2.child = obj1;

        const result = validate(
            obj1,
            {
                name: {
                    validator: VEUIRulesValidator, rules: [{name: 'required'}],
                },
                child: '^1',
            }
        );
        expect(result.name).toBe(true);
        expect(result.child.child).toBe(result);
    });
});
