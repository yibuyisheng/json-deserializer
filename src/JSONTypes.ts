export type JSONBaseType = string | number | true | false | null;

export type JSONValue = IJSONObject | IJSONArray | JSONBaseType;

export interface IJSONObject {
    [key: string]: JSONValue;
}

export interface IJSONArray extends Array<JSONValue> {
    [index: number]: JSONValue;
}
