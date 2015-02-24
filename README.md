# Introduction

This library is inspired by [jsonj](https://github.com/jillesvangurp/jsonj), the java library for parsing and manipulating json structures in java that we developed at [Inbot](http://inbot.io). While javascript of course supports json natively, it misses a few of the features present in jsonj. This small library attempts to rectify this.

## Install

```
$ npm install jsonjs
```

## Usage

```javascript
var jsonjs = require('jsonjs');
var obj = jsonjs.decorate({
  foo: 'baa',
  arr: []
});

expect(obj.get('foo')).toEqual('baa');
expect(obj.get('arr')).toEqual(jasmine.any(Array));

obj.put('cool', 'deep', 'nested', 'object', true);
expect(obj.get('cool', 'deep', 'nested', 'object')).toEqual(true);

var realObject = obj.get();
expect(realObject.cool.deep.nested.object).toEqual(true);

var newObject = obj.getOrCreateObject('im', 'new');
expect(obj.get()).toEqual(jasmine.objectContaining({ im: { new: {} } }));
expect(newObject).toEqual({});

newObject.newProperty = 'new value';
expect(newObject).toEqual(jasmine.objectContaining({ newProperty: 'new value' }));
expect(obj.get().im.new).toEqual(jasmine.objectContaining({ newProperty: 'new value' }));
expect(obj.get('im', 'new', 'newProperty')).toEqual("new value");
expect(obj.data.im.new.newProperty).toEqual("new value");

var arr = obj.getOrCreateArray('arr');
expect(arr).toEqual(jasmine.any(Array));
expect(arr.length).toBe(0);
expect(arr).toEqual([]);

arr.push('x');
expect(arr.length).toBe(1);
expect(arr).toEqual(['x']);
expect(obj.get('arr')).toEqual(['x']);
```

Check [tests](https://github.com/Inbot/jsonjs/blob/master/spec/jsonjs_spec.js) for more examples.

