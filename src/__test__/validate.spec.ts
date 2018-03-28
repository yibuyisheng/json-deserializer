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

    it('should validate object.', () => {
        const result = validate(
            {
                name: 'yibuyisheng'
            },
            {
                name: {
                    validator: VEUIRulesValidator,
                    rules: [
                        {
                            name: 'pattern',
                            value: /^[a-z]+$/
                        }
                    ]
                }
            }
        );
        expect(result).toEqual({name: true});
    });

    it('should get invalid messages while the validation fails.', () => {
        const result = validate(
            {
                name: {
                    first: 'Li',
                    last: 'Zhang',
                }
            },
            {
                name: {
                    validator: VEUIRulesValidator,
                    rules: [
                        {
                            name: 'pattern',
                            value: /^[a-z]+$/,
                            message: '格式不符合要求',
                        }
                    ]
                }
            }
        );
        expect(result).toEqual(
            {
                name: {
                    message: 'Validate fail with VEUI rules.',
                    detail: [
                        {
                            name: 'pattern',
                            message: '格式不符合要求'
                        }
                    ],
                    keyPath: ['name']
                }
            }
        );
    });

    it('should get `true` while the validation succeed.', () => {
        const result = validate(
            {
                name: {
                    first: 'Li',
                    last: 'Zhang',
                }
            },
            {
                name: {
                    first: {
                        validator: VEUIRulesValidator,
                        rules: [
                            {
                                name: 'pattern',
                                value: /^[a-z]+$/i,
                                message: '格式不符合要求',
                            }
                        ],
                    }
                }
            }
        );
        expect(result).toEqual({name: {first: true}});
    });

    it('should get flatten error message while set the flatten option.', () => {
        const result = validate(
            {
                name: {
                    first: 'Li',
                    last: 'Zhang',
                },
            },
            {
                name: {
                    validator: VEUIRulesValidator,
                    rules: [
                        {
                            name: 'pattern',
                            value: /^[a-z]+$/,
                            message: '格式不符合要求',
                        }
                    ]
                },
            },
            {
                flattenResult: true,
            }
        );
        expect(result).toEqual([
            {
                keyPath: ['name'],
                result: {
                    detail: [{message: '格式不符合要求', name: 'pattern'}],
                    keyPath: ['name'],
                    message: 'Validate fail with VEUI rules.',
                },
            }
        ]);
    });

    it('should get all flatten error messages while set the `all` option.', () => {
        const result = validate(
            {
                name: ['Li', 'Zhang'],
            },
            {
                name: {
                    validator: VEUIRulesValidator,
                    rules: [
                        {
                            name: 'pattern',
                            value: /^[a-z]+$/,
                            message: '格式不符合要求',
                        }
                    ]
                },
            },
            {
                flattenResult: true,
                all: true,
            }
        );
        expect(result).toEqual([
            {
                keyPath: ['name', 0],
                result: {
                    detail: [{message: '格式不符合要求', name: 'pattern'}],
                    keyPath: ['name', 0],
                    message: 'Validate fail with VEUI rules.',
                },
            },
            {
                keyPath: ['name', 1],
                result: {
                    detail: [{message: '格式不符合要求', name: 'pattern'}],
                    keyPath: ['name', 1],
                    message: 'Validate fail with VEUI rules.',
                },
            }
        ]);
    });

    it('should handle nested arrays.', () => {
        let result = validate(
            [[20]],
            [[{validator: VEUIRulesValidator, rules: [{name: 'max', value: 21}]}]],
            {
                flattenResult: true,
                all: true,
            }
        );
        expect(result).toEqual(true);

        result = validate(
            [[18, 20, 17, 23]],
            [[{validator: VEUIRulesValidator, rules: [{name: 'max', value: 19}]}]],
            {
                flattenResult: true,
                all: true,
            }
        );
        expect(result).toEqual([
            {
                keyPath: [0, 1],
                result: {
                    detail: [
                        {
                            message: '不能大于19',
                            name: 'max',
                        }
                    ],
                    keyPath: [0, 1],
                    message: 'Validate fail with VEUI rules.',
                }
            },
            {
                keyPath: [0, 3],
                result: {
                    detail: [
                        {
                            message: '不能大于19',
                            name: 'max'
                        }
                    ],
                    keyPath: [0, 3],
                    message: 'Validate fail with VEUI rules.'
                }
            }
        ]);
    });

    it('should throw error by default while encounter the circular object.', () => {
        const obj1: Record<string, any> = {};
        const obj2: Record<string, any> = {};

        obj1.name = 'zhangsan';
        obj2.name = 'lisi';

        obj1.child = obj2;
        obj2.child = obj1;

        const fn = () => validate(
            obj1,
            {
                name: {
                    validator: VEUIRulesValidator, rules: [{name: 'required'}],
                },
                child: '^1',
            },
            {
                noCircular: true,
            }
        );
        expect(fn).toThrowError('Circular object');
    });

    it('should return error while the target is not exist on the object.', () => {
        const result = validate(
            {},
            {name: {validator: VEUIRulesValidator, rules: [{name: 'required'}]}}
        );
        expect(result).toEqual({"name": {"detail": [{"message": "请填写", "name": "required"}], "keyPath": ["name"], "message": "Validate fail with VEUI rules."}});
    });

    it('should not return error while validating the non-exist property if set the `inputFirst` option to `true`.', () => {
        const result = validate(
            {},
            {name: {validator: VEUIRulesValidator, rules: [{name: 'required'}]}},
            {inputFirst: true, flattenResult: true}
        );
        expect(result).toEqual(true);
    });

});
