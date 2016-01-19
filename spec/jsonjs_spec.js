"use strict";

var jsonjs = require('../jsonjs');

describe('jsonjs module', function(){
  describe('#decorate', function(){
    it('should decorate object', function(){
      var obj = { foo: 42 };
      var json = jsonjs.decorate(obj);
      expect((json instanceof jsonjs.JSONObject)).toBeTruthy();
      expect(json.data).toEqual(jasmine.any(Object));
      expect(json.data.foo).toEqual(42);
      expect(json.data).toBe(obj);
      json.put('foo', 43);
      expect(json.get('foo')).toEqual(43);
      expect(obj.foo).toEqual(43);
    });

    it('should create empty json object instance if no data is definied', function(){
      var json = jsonjs.decorate();
      expect(json instanceof jsonjs.JSONObject).toBeTruthy();
      expect(Object.keys(json.data).length).toBe(0);
    });
  });

  describe('#object', function(){
    it('should create decorated object instance', function(){
      var json = jsonjs.object();
      expect(json).toEqual(jasmine.any(jsonjs.JSONObject));
      expect(json instanceof jsonjs.JSONObject).toBeTruthy();
      expect(json.data).toEqual(jasmine.any(Object));
      expect(Object.keys(json.data).length).toBe(0);
    });
  });

  describe('#decoratedCopy', function(){
    it('should clone the original object and decorate it', function(){
      var original = { foo: 'baa' };
      var json = jsonjs.decoratedCopy(original);
      expect(json).toEqual(jasmine.any(jsonjs.JSONObject));
      expect(json.data).toEqual(original);
      expect(json.data).not.toBe(original);
      json.data.foo = 'foobaa';
      expect(original.foo).not.toEqual('foobaa');
      expect(json.get('foo')).toEqual('foobaa');
      json.put('foo', 'f00baa');
      expect(original.foo).not.toEqual('f00baa');
      expect(json.get('foo')).toEqual('f00baa');
    });
  });

  describe('#array', function() {
    it('should return JSONArray', function(){
      var arr = jsonjs.array();
      expect(arr).toEqual(jasmine.any(jsonjs.JSONArray));
      expect(arr instanceof jsonjs.JSONArray).toBeTruthy();
      expect(arr.arr).toEqual(jasmine.any(Array));
    });
  });

  describe('JSONArray', function(){
    describe('#array', function(){
      it('should return original array', function(){
        var arr = jsonjs.decorate([
          {
            foo: 34
          }
        ]);

        expect(arr.array()).toEqual(jasmine.any(Array));
        expect(arr.array()).not.toEqual(jasmine.any(jsonjs.JSONArray));
        expect(arr.array()[0]).toEqual(jasmine.any(Object));
        expect(arr.array()[0]).not.toEqual(jasmine.any(jsonjs.JSONObject));

        expect(arr.get()[0]).toEqual(jasmine.any(Object));
        expect(arr.get()[0]).toEqual(arr.get(0));
        expect(arr.get()[0]).not.toEqual(jasmine.any(jsonjs.JSONObject));
      });
    });

    describe('#objects', function(){
      it('should return array with decorated JSONObjects', function(){
        var arr = jsonjs.decorate([
          {
            foo: 34
          }
        ]);

        expect(arr.objects()[0]).toEqual(jasmine.any(jsonjs.JSONObject));
        expect(arr.objects()[0].get('foo')).toEqual(34);
        expect(arr.objects()[0]).toEqual(arr.getObject(0));
        expect(arr.getObject(0).get('foo')).toEqual(34);
      });
    });
  });

  describe('JSONObject', function(){
    describe('#get', function(){
      var json;

      beforeEach(function(){
        json = jsonjs.decorate({
          foo: 43,
          a: {
            b: 42,
            c: [ 1, { two: { three: "four" } } ]
          }
        });
      });

      it('should return value from object', function(){
        expect(json.get('foo')).toEqual(43);
        expect(json.get('a', 'b')).toEqual(42);
      });

      it('should return value from nested array', function(){
        expect(json.get('a', 'c', 0)).toEqual(1);
        expect(json.get('a', 'c', 1, 'two', 'three')).toEqual('four');
      });

      it('should return undefined if requested key doesnt exist', function(){
        expect(json.get('i', 'dont', 'exist')).toBeUndefined();
      });
    });

    describe('#has', function(){
       var json;

      beforeEach(function(){
        json = jsonjs.decorate({
          foo: 43,
        });
      });

      it('should return true if key has a value', function(){
        expect(json.has('foo')).toBe(true);
      });

      it('should return false if key doesnt have value', function() {
        expect(json.has('nonexisting')).toBe(false);
      });
    });

    describe('#is', function() {
      it('should return true if value with given keys is given type', function() {
        var json = jsonjs.decorate({
          str: 'string',
          num: 43,
          bool: true,
          arr: [],
          obj: {}
        });

        expect(json.is('str', 'string')).toBe(true);
        expect(json.is('num', 'number')).toBe(true);
        expect(json.is('bool', 'boolean')).toBe(true);
        expect(json.is('arr', 'array')).toBe(true);
        expect(json.is('obj', 'object')).toBe(true);
      });
    });

    describe('#put', function(){
      it('should put nested value', function(){
        var json = jsonjs.object();
        json.put('a', 'b', 'c', 'd', 123);
        expect(json.get('a', 'b', 'c', 'd')).toEqual(123);
        expect(json.data.a.b.c.d).toEqual(123);
      });

      it('should update existing value', function(){
        var json = jsonjs.object();
        json.put('a', 'b', 'c', 'd', 123);
        json.put('a', 'b', 'c', 'd', 321);
        expect(json.get('a', 'b', 'c', 'd')).toEqual(321);
      });

      it('should put value to array', function(){
        var json = jsonjs.decorate({ arr: ['a', 'b'] });
        json.put('arr', 0, 'x');
        expect(json.get('arr', 0)).toEqual('x');
      });

      it('should work with complex nested structures', function(){
        var json = jsonjs.decorate({
          a: {
           b: [
             {
               title: 'foo',
               arr: []
             },
             {
               title: 'baa',
               arr: []
             }
           ]
          }
        });

        expect(json.put('a', 'b', 0, 'title', 'foobaa'));
        expect(json.get('a', 'b', 0, 'title')).toEqual('foobaa');
        expect(json.get().a.b[0].title).toEqual('foobaa');

        expect(json.put('a', 'b', 0, 'arr', 0, 'a'));
        expect(json.get('a', 'b', 0, 'arr', 0)).toEqual('a');
        expect(json.get().a.b[0].arr[0]).toEqual('a');
      });
    });

    describe('#delete', function(){
      it('should throw given no arguments', function(){
        expect(function(){
          json.object().delete();
        }).toThrow();
      });

      it('should return value and delete property', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.delete('foo');
        expect(value).toBeDefined();
        expect(value).toEqual({ a: 1 });
        expect(json.get('foo')).toBeUndefined();
        expect(json.get('foo', 'a')).toBeUndefined();
        expect(json.object().foo).toBeUndefined();
      });

      it('should return value and delete property for nested key', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.delete('foo', 'a');
        expect(value).toBeDefined();
        expect(value).toEqual(1);
        expect(json.get('foo', 'a')).toBeUndefined();
        expect(json.object().foo.a).toBeUndefined();
      })
    });

    describe('#getOrCreateObject', function(){
      it('should return existing object', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.getOrCreateObject('foo');
        expect(value).toBeDefined();
        expect(value).toEqual(jasmine.any(Object));
        expect(value).toEqual({ a: 1 });
        expect(json.data.foo).toEqual({ a: 1 });
        expect(json.get('foo')).toEqual({ a: 1 });
        expect(json.get('foo', 'a')).toEqual(1);
      });

      it('should create new object given non existing value', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.getOrCreateObject('baa');
        expect(value).toEqual(jasmine.any(Object));
        expect(value).toEqual({});
      });

      it('should allow passing nested keys as an array', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 },
          baa: { foo: { a: 2 } }
        });

        var v1 = json.getOrCreateObject(['baa', 'foo']);
        expect(v1).toEqual(jasmine.any(Object));
        expect(v1).toEqual({ a: 2 });

        var v2 = json.getOrCreateObject(['baa', 'nonexisting']);
        expect(v2).toEqual(jasmine.any(Object));
        expect(v2).toEqual({});
      });

      it('should reflect changes to returned value back to the original object', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.getOrCreateObject('foo');
        expect(value).toEqual(jasmine.any(Object));
        expect(value).toEqual({ a: 1 });
        value.b = 'foo';
        expect(value).toEqual(jasmine.objectContaining({ b: 'foo' }));
        expect(json.data.foo.b).toEqual('foo');
        expect(json.get('foo', 'b')).toEqual('foo');
      });

      it('should reflect changes to returned value to the stubbed empty object', function(){
        var json = jsonjs.decorate({
          foo: { a: 1 }
        });

        var value = json.getOrCreateObject('baa');
        expect(value).toEqual(jasmine.any(Object));
        expect(value).toEqual({});
        value.b = 'foo';
        expect(value).toEqual(jasmine.objectContaining({ b: 'foo' }));
        expect(json.data.baa.b).toEqual('foo');
        expect(json.get('baa', 'b')).toEqual('foo');
      });

      it('should throw if returned value is not an object', function(){
        var json = jsonjs.decorate({ foo: [], baa: 'foo' });
        expect(function(){ json.getOrCreateObject('foo') }).toThrow();
        expect(function(){ json.getOrCreateObject('baa') }).toThrow();
      });
    });

    describe('#getOrCreateDecoratedObject', function() {
      it('should return existing decorated object', function() {
        var json = jsonjs.decorate({
          foo: {a: 1}
        });

        var value = json.getOrCreateDecoratedObject('foo');
        expect(value).toBeDefined();
        expect(value).toEqual(jasmine.any(Object));
        expect(value).toEqual(jasmine.any(jsonjs.JSONObject));
        expect(value.data).toEqual({ a: 1 });
        expect(value.get('a')).toEqual(1);
      });
    });

    describe('#getOrCreateArray', function(){
      it('should return existing object', function(){
        var json = jsonjs.decorate({ foo: [1, 2] });
        var value = json.getOrCreateArray('foo');
        expect(value).toBeDefined();
        expect(value).toEqual(jasmine.any(Array));
        expect(value).toEqual([1, 2]);
        expect(json.data.foo).toEqual([1, 2]);
        expect(json.get('foo')).toEqual([1, 2]);
      });

      it('should create new array given non existing value', function(){
        var json = jsonjs.decorate({ foo: [1, 2] });
        var value = json.getOrCreateArray('baa');
        expect(value).toEqual(jasmine.any(Array));
        expect(value).toEqual([]);
      });

      it('should reflect changes to returned value back to the original array', function(){
        var json = jsonjs.decorate({ foo: [1, 2] });
        var value = json.getOrCreateArray('foo');
        expect(value).toEqual(jasmine.any(Array));
        expect(value).toEqual([1, 2]);
        value.push(3);
        expect(value).toEqual([1, 2, 3]);
        expect(json.data.foo).toEqual([1, 2, 3]);
        expect(json.get('foo')).toEqual([1, 2, 3]);
        expect(json.get('foo', 2)).toEqual(3);
      });

      it('should reflect changes to returned value to the stubbed empty array', function(){
        var json = jsonjs.decorate({ foo: [1, 2] });
        var value = json.getOrCreateArray('baa');
        expect(value).toEqual(jasmine.any(Array));
        expect(value).toEqual([]);
        value.push(3);
        expect(value).toEqual([3]);
        expect(json.data.baa).toEqual([3]);
        expect(json.get('baa')).toEqual([3]);
        expect(json.get('baa', 0)).toEqual(3);
      });

      it('should throw if returned value is not an array', function(){
        var json = jsonjs.decorate({ foo: {}, baa: 'foo' });
        expect(function(){ json.getOrCreateArray('foo') }).toThrow();
        expect(function(){ json.getOrCreateArray('baa') }).toThrow();
      });
    });

    describe('#object', function(){
      it('should return reference to the original object', function(){
        var obj = jsonjs.decorate({ foo: 'baa' });
        expect(obj.object()).toBe(obj.data);
      });
    });

    describe('#keys', function() {
      it('should return keys from original object', function() {
        var obj = jsonjs.decorate({ foo: 1, baa: 2, arr: [1,2] });
        expect(obj.keys()).toEqual(jasmine.any(Array));
        expect(obj.keys().length).toBe(3);
        expect(obj.keys()).toContain('foo', 'baa', 'arr');
      });
    });

    describe('#deepClone', function(){
      var original;

      beforeEach(function(){
        original = jsonjs.decorate({ foo: 'baa' });
      });

      it('should return copy of internal object', function(){
        var cloned = original.deepClone();
        expect(cloned).toEqual(original.object());
        expect(cloned).not.toBe(original.object());
      });

      it('should not modify original object when cloned object is modified', function(){
        var cloned = original.deepClone();
        cloned.foo = 'foobaa';
        expect(cloned).not.toEqual(original.object());
      });
    });

    describe('#decoratedClone', function(){
      var original;

      beforeEach(function(){
        original = jsonjs.decorate({ foo: 'baa' });
      });

      it('should return copy of JSONObject instance', function(){
        var cloned = original.decoratedClone();
        expect(cloned).toEqual(jasmine.any(jsonjs.JSONObject));
        expect(cloned.object()).toEqual(original.object());
        expect(cloned).not.toBe(original);
      });

      it('should not modify original JSONObject when cloned instance is modified', function(){
        var cloned = original.decoratedClone();
        cloned.put('foo', 'foobaa');
        expect(cloned.get('foo')).not.toEqual(original.get('foo'));
        expect(cloned.object()).not.toBe(original.object());
        expect(cloned.object()).not.toEqual(original.object());
      });
    });

    describe('convenience methods', function() {
      var json;

      beforeEach(function(){
        json = jsonjs.decorate({
          str: 'foobaa',
          noone: undefined,
          int: 1,
          floaty: 1.1,
          arr: [],
          obj: { foo: 'baa' },
          truthy: true
        });
      });

      describe('#getString', function() {
        it('should return string', function(){
          expect(json.getString('str')).toEqual(jasmine.any(String));
          expect(json.getString('str')).toEqual('foobaa');
        });

        it('should throw if value is not a string', function(){
          expect(function() { json.getString('noone') }).toThrow();
          expect(function() { json.getString('int') }).toThrow();
          expect(function() { json.getString('floaty') }).toThrow();
          expect(function() { json.getString('arr') }).toThrow();
          expect(function() { json.getString('obj') }).toThrow();
        });
      });

      describe('#getBoolean', function() {
        it('should return boolean', function(){
          expect(json.getBoolean('truthy')).toBe(true);
        });

        it('should throw if value is not a boolean', function(){
          expect(function(){ json.getBoolean('int') }).toThrow();
          expect(function(){ json.getBoolean('arr') }).toThrow();
          expect(function(){ json.getBoolean('obj') }).toThrow();
          expect(function(){ json.getBoolean('noone') }).toThrow();
        });
      });

      describe('#getInt', function() {
        it('should return integer', function(){
          expect(json.getInt('int')).toEqual(jasmine.any(Number));
          expect(json.getInt('int')).toEqual(json.data.int);
          expect(json.getInt('floaty')).toEqual(parseInt(json.data.floaty));
          expect(json.getInt('int') % 1).toEqual(0);
        });

        it('should throw if value is not a int', function(){
          expect(function() { json.getInt('str') }).toThrow();
          expect(function() { json.getInt('noone') }).toThrow();
          expect(function() { json.getInt('arr') }).toThrow();
          expect(function() { json.getInt('obj') }).toThrow();
        });
      });

      describe('#getFloat', function() {
        it('should return float', function(){
          expect(json.getFloat('floaty')).toEqual(jasmine.any(Number));
          expect(json.getFloat('floaty')).toEqual(json.data.floaty);
          expect(json.getFloat('floaty') % 1).not.toEqual(0);
          expect(json.getFloat('int')).toEqual(1.0);
          expect(json.getFloat('int') % 1).toEqual(0);
        });

        it('should throw if value is not a float', function(){
          expect(function() { json.getFloat('str') }).toThrow();
          expect(function() { json.getFloat('noone') }).toThrow();
          expect(function() { json.getFloat('arr') }).toThrow();
          expect(function() { json.getFloat('obj') }).toThrow();
        });
      });

      describe('#getObject', function() {
        it('should return an object', function(){
          expect(json.getObject('obj')).toEqual(jasmine.any(Object));
          expect(json.getObject('obj')).not.toEqual(jasmine.any(Array));
          expect(json.getObject('obj')).not.toEqual(jasmine.any(jsonjs.JSONObject));
        });

        it('should throw if value is not an object', function(){
          expect(function() { json.getObject('str') }).toThrow();
          expect(function() { json.getObject('int') }).toThrow();
          expect(function() { json.getObject('floaty') }).toThrow();
          expect(function() { json.getObject('noone') }).toThrow();
          expect(function() { json.getObject('arr') }).toThrow();
        });
      });

      describe('#getArray', function() {
        it('should return an array', function(){
          expect(json.getArray('arr')).toEqual(jasmine.any(Object));
          expect(json.getArray('arr')).toEqual(jasmine.any(Array));
          expect(json.getArray('arr')).not.toEqual(jasmine.any(jsonjs.JSONArray));
        });

        it('should throw if value is not an array', function(){
          expect(function() { json.getArray('str') }).toThrow();
          expect(function() { json.getArray('int') }).toThrow();
          expect(function() { json.getArray('floaty') }).toThrow();
          expect(function() { json.getArray('noone') }).toThrow();
          expect(function() { json.getArray('obj') }).toThrow();
        });
      });

      describe('#getDecoratedObject', function() {
        it('should return a decorated object', function(){
          expect(json.getDecoratedObject('obj')).toEqual(jasmine.any(Object));
          expect(json.getDecoratedObject('obj')).toEqual(jasmine.any(jsonjs.JSONObject));
        });
      });

      describe('#getDecoratedArray', function() {
        it('should return a decorated array', function(){
          expect(json.getDecoratedArray('arr')).not.toEqual(jasmine.any(Array));
          expect(json.getDecoratedArray('arr')).toEqual(jasmine.any(jsonjs.JSONArray));
        });
      });
    });

    describe('utils', function(){
      describe('#isType', function() {
        it('should detect object', function() {
          expect(jsonjs.utils.isType({}, 'object')).toBe(true);
          expect(jsonjs.utils.isType([], 'object')).toBe(false);
        });

        it('should detect arrays', function() {
          expect(jsonjs.utils.isType({}, 'array')).toBe(false);
          expect(jsonjs.utils.isType([], 'array')).toBe(true);
        });

        it('should detect strings', function() {
          expect(jsonjs.utils.isType('foo', 'string')).toBe(true);
          expect(jsonjs.utils.isType('1.1', 'string')).toBe(true);
          expect(jsonjs.utils.isType('', 'string')).toBe(true);
          expect(jsonjs.utils.isType('1', 'string')).toBe(true);
          expect(jsonjs.utils.isType(1, 'string')).toBe(false);
          expect(jsonjs.utils.isType([], 'string')).toBe(false);
          expect(jsonjs.utils.isType({}, 'string')).toBe(false);
          expect(jsonjs.utils.isType(null, 'string')).toBe(false);
          expect(jsonjs.utils.isType(undefined, 'string')).toBe(false);
        });

        it('should detect numbers', function() {
          expect(jsonjs.utils.isType(1, 'number')).toBe(true);
          expect(jsonjs.utils.isType(1.1, 'number')).toBe(true);
          expect(jsonjs.utils.isType('1', 'number')).toBe(true);
          expect(jsonjs.utils.isType('1.0', 'number')).toBe(true);
          expect(jsonjs.utils.isType('1.1', 'number')).toBe(true);
          expect(jsonjs.utils.isType('1.1a', 'number')).toBe(false);
          expect(jsonjs.utils.isType(null, 'number')).toBe(false);
        });

        it('should detect ints', function() {
          expect(jsonjs.utils.isType(1, 'int')).toBe(true);
          expect(jsonjs.utils.isType(1.1, 'int')).toBe(false);
          expect(jsonjs.utils.isType(1.0, 'int')).toBe(true);
          expect(jsonjs.utils.isType('1', 'int')).toBe(true);
          expect(jsonjs.utils.isType('1.0', 'int')).toBe(true);
          expect(jsonjs.utils.isType('1.1', 'int')).toBe(false);
          expect(jsonjs.utils.isType('', 'int')).toBe(false);
          expect(jsonjs.utils.isType([], 'int')).toBe(false);
          expect(jsonjs.utils.isType({}, 'int')).toBe(false);
        })

        it('should detect floats', function() {
          expect(jsonjs.utils.isType(1, 'float')).toBe(true);
          expect(jsonjs.utils.isType(1.1, 'float')).toBe(true);
          expect(jsonjs.utils.isType(1.0, 'float')).toBe(true);
          expect(jsonjs.utils.isType('1', 'float')).toBe(true);
          expect(jsonjs.utils.isType('1.0', 'float')).toBe(true);
          expect(jsonjs.utils.isType('1.1', 'float')).toBe(true);
          expect(jsonjs.utils.isType('', 'float')).toBe(false);
          expect(jsonjs.utils.isType([], 'int')).toBe(false);
          expect(jsonjs.utils.isType({}, 'int')).toBe(false);
        });
      });

      describe('#isTypeStrict', function(){
        it('should validate primitive and throw if not matching', function(){
          expect(function(){ jsonjs.utils.isTypeStrict(1, 'string') }).toThrow();
          expect(function(){ jsonjs.utils.isTypeStrict('foo', 'string') }).not.toThrow();
        });
      });

      describe('#deepMerge', function(){
        var original;

        beforeEach(function(){
          original = { foo: 'baa', foobaa: { foo: 'baa' } };
        });

        it('should append properties to empty object', function(){
          var blank = {};
          jsonjs.utils.deepMerge(blank, original);
          expect(blank).toEqual(original);
        });

        it('should override properties on top level', function(){
          jsonjs.utils.deepMerge(original, {
            foo: 'foo'
          });
          expect(original.foo).toEqual('foo');
        });

        it('should override or append nested properties', function(){
          jsonjs.utils.deepMerge(original, {
            foobaa: {
              foo: 'foo',
              baa: 'foobaa'
            }
          });
          expect(original.foo).toEqual('baa');
          expect(original.foobaa.foo).toEqual('foo');
          expect(original.foobaa.baa).toEqual('foobaa');
        });

        it('should override or append nested properties', function(){
          jsonjs.utils.deepMerge(original, {
            foobaa: 'foobaa'
          });
          expect(original.foobaa).toEqual(jasmine.any(String));
          expect(original.foobaa).toEqual('foobaa');
        });
      });

      describe('#extend', function(){
        var original;

        beforeEach(function(){
          original = { foo: 'baa', baa: { foo: 'baa' } };
        });

        it('should extend empty object with two objects', function(){
          var blank = {};
          jsonjs.utils.extend(blank, original, {
            xyz: 1,
            foo: 'foobaa'
          });

          expect(blank.baa).toEqual(original.baa);
          expect(blank.foo).toEqual('foobaa');
          expect(blank.xyz).toBe(1);
        });

        it('should extend empy object with one object and keep arrays as arrays', function(){
          var blank = {};

          jsonjs.utils.extend(blank, {
            arr: [1,2,3]
          });

          expect(blank.arr).toEqual(jasmine.any(Array));
          expect(blank.arr).toEqual([1, 2, 3]);
        });
      });
    })
  });
});

describe('usage example', function(){
  it('should pass', function(){
    var obj = jsonjs.decorate({
      foo: 'baa',
      arr: [],
      items: [
        { foo: "foobaa" }
      ]
    });

    expect(obj.get('foo')).toEqual('baa');
    expect(obj.get('arr')).toEqual(jasmine.any(Array));

    obj.put('cool', 'deep', 'nested', 'object', true);
    expect(obj.get('cool', 'deep', 'nested', 'object')).toEqual(true);

    var realObject = obj.object();
    expect(realObject.cool.deep.nested.object).toEqual(true);

    var newObject = obj.getOrCreateObject('im', 'new');
    expect(obj.object()).toEqual(jasmine.objectContaining({ im: { new: {} } }));
    expect(newObject).toEqual({});

    newObject.newProperty = 'new value';
    expect(newObject).toEqual(jasmine.objectContaining({ newProperty: 'new value' }));
    expect(obj.object().im.new).toEqual(jasmine.objectContaining({ newProperty: 'new value' }));
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

    var decoratedCopy = obj.copy();
    expect(decoratedCopy).not.toBe(obj);
    expect(decoratedCopy.object()).toEqual(obj.object());

    var originalObjectClone = obj.clone();
    expect(originalObjectClone).not.toBe(obj.object());
    expect(originalObjectClone).toEqual(obj.object());

    var decoratedArray = obj.getOrCreateDecoratedArray('items');
    expect(decoratedArray.get(0).foo).toEqual('foobaa');
    var item = decoratedArray.getObject(0);
    item.put('foo', 'baa');
    expect(item.get('foo')).toEqual('baa');
    expect(decoratedArray.get(0).foo).toEqual('baa');
    expect(obj.get('items', 0, 'foo')).toEqual('baa');

    decoratedArray = obj.getOrCreateDecoratedArray('numbers');
    expect(decoratedArray.array().length).toEqual(0);
    decoratedArray.push('foo');
    expect(decoratedArray.array().length).toEqual(1);
    expect(decoratedArray.get(0)).toEqual('foo');
  });
});
