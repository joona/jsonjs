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

console.log(obj.get('foo'));                                // => "baa"

// set value deep into the object
obj.put('cool', 'deep', 'nested', 'object', true);
console.log(obj.get('cool', 'deep', 'nested', 'object'));   // => true

var realObject = obj.get();                                 // get real raw object
console.log(realObject.cool.deep.nested.object);            // => true

var newObject = obj.getOrCreateObject('im', 'new');
// becomes { im: { new: {} }, arr: [Array...], cool: [Object...] }

console.log(newObject);                                     // => {}

newObject.newProperty = 'new value';
console.log(newObject);                                     // => { newProperty: 'new value' }
console.log(obj.get().im.new);                              // => { newProperty: 'new value' }
console.log(obj.get('im', 'new', 'newProperty');            // => "new value"

var arr = obj.getOrCreateArray('arr');
console.log(arr);                                           // => []
arr.push('x');
console.log(arr);                                           // => ["x"]
console.log(obj.get('arr'))                                 // => ["x"]
```

Check tests for more examples.

