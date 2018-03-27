/**
 * @file VEUIRule
 * @author yibuyisheng(yibuyisheng@163.com)
 */
declare module 'veui/managers/rule' {
    export type VEUIValidateResult = true | Array<{name: string; message: string;}>;

    const rule: {
        validate(val: any, rules: string | any[]): VEUIValidateResult;
    };
    export default rule;
}
