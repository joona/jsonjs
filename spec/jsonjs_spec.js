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
      expect(json instanceof jsonjs.JSONObject).toBeTruthy();
      expect(json.data).toEqual(jasmine.any(Object));
      expect(Object.keys(json.data).length).toBe(0);
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
      });

      it('should reflect changes to returned value to the stubbed empty array', function(){
        var json = jsonjs.decorate({ foo: [1, 2] });
        var value = json.getOrCreateArray('baa');
        expect(value).toEqual(jasmine.any(Array));
        expect(value).toEqual([]);
        value.push(3);
        expect(value).toEqual([3]);
        expect(json.data.baa).toEqual([3]);
      });

      it('should throw if returned value is not an array', function(){
        var json = jsonjs.decorate({ foo: {}, baa: 'foo' });
        expect(function(){ json.getOrCreateArray('foo') }).toThrow();
        expect(function(){ json.getOrCreateArray('baa') }).toThrow();
      });
    });
  });
});