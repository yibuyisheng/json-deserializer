# JSON Deserializer

[![Build Status](https://travis-ci.org/yibuyisheng/json-deserializer.svg?branch=master)](https://travis-ci.org/yibuyisheng/json-deserializer)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fyibuyisheng%2Fjson-deserializer.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fyibuyisheng%2Fjson-deserializer?ref=badge_shield)

# 安装

JSON Deserializer 使用 [moment](https://github.com/moment/moment) 处理 JSON 数据中的日期字符串。

```
npm install json-deserializer
```

# 为什么开发这个库？

在大型 SPA 应用开发中，前后端数据交互基本都是基于 JSON 的。如果后端使用的是强类型语言（比如 Java ），在获取到前端传递的 JSON 数据的时候，一般会反序列化为某个（或某几个）类的对象，以便后续处理。

那么前端在拿到后端传递的 JSON 数据的时候，由于 JavaScript 对 JSON 天然友好的支持，所以很多时候可以直接 `JSON.parse(jsonString)` 一下就可以使用了。但是后端开发者很多时候对 JSON 数据理解的不一样，或者强类型语言操作 JSON 很麻烦，造成传递给前端的 JSON 数据总是不尽人意，此时就少不了对后端数据做 normalize 了。

# 如何使用？

JSON Deserializer 的输入是一个 JSON 对象，输出是一个 JavaScript 对象。

## API

### deserialize(jsonObject, config)

* 参数

    - `jsonObject` JSON 对象
    - `config` schema 配置

* 返回值

    JavaScript 对象。

### 使用示例

* 转换 JSON 数组

```js
import deserialize, {StringParser} from 'json-deserializer';

const jsonObject = [20];
const schema = [StringParser];
deserialize(jsonObject, schema); // result: ['20']
```

* 转换 JSON 对象

```js
import deserialize, {StringParser} from 'json-deserializer';

const jsonObject = {"name": "yibuyisheng", "age": 20};
const schema = {name: StringParser};
deserialize(jsonObject, schema); // result: {name: 'yibuyisheng'}
```

* 转换 JSON 基本类型

```js
import deserialize, {StringParser} from 'json-deserializer';

const jsonObject = 'yibuyisheng';
const schema = StringParser;
deserialize(jsonObject, schema); // result: 'yibuyisheng'
```

# Changelog

## v0.0.4

### 💡 主要变更

* [+] 在 index.js 中导出模块。

## v0.0.3

### 💡 主要变更

* [+] 新增校验器，可以对 JS 对象进行全方位校验，支持检测包含循环引用的对象。
* [+] 支持检测带有循环引用的 JSON 对象。

## v0.0.2

### 💡 主要变更

* [+] 支持对 JSON 对象的 normalize 。
