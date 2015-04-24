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

    describe('utils', function(){
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
      });
    })
  });
});

describe('usage example', function(){
  it('should pass', function(){
    var obj = jsonjs.decorate({
      foo: 'baa',
      arr: []
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
  });
});