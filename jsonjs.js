"use strict";

/**
 * TODO:
 * - keep map of nested key paths to prevent looping all the time
 * - add more features from original jsonj
 */

/**
 * Clone an object
 * @param {object} obj
 * @returns {object}
 */
function clone(obj) {
  var cloned = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      cloned[i] = obj[i];
    }
  }
  return cloned;
}

/**
 * Deep clone an object
 * @param {object} obj
 * @returns {object}
 */
function deepClone(obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }
  var cloned = obj.constructor();
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge one object to another
 * @param one
 * @param another
 * @returns {*}
 */
function deepMerge(one, another) {
  if (another == null || typeof another !== 'object') {
    return another;
  }

  if(one == null && typeof another === 'object') {
    if(Array.isArray(another)) {
      one = [];
    } else {
      one = {};
    }
  }

  var cloned = deepClone(another);

  for (var key in cloned) {
    if (cloned.hasOwnProperty(key)) {
      one[key] = deepMerge(one[key], another[key]);
    }
  }
  return one;
}

function extend(){
  var args = Array.prototype.slice.call(arguments);
  var original = args.shift();

  args.forEach(function(obj){
    deepMerge(original, obj);
  });

  return original;
}

function isType(primitive, type) {
  var rval = false;

  switch(type) {
    case 'array':
      if(typeof primitive == "object" && Array.isArray(primitive)) {
        rval = true;
      }
      break;
    case 'object':
      if(typeof primitive == "object" && !Array.isArray(primitive)) {
        rval = true;
      }
      break;
    case 'string':
      if(typeof primitive == "string") {
        rval = true;
      }
      break;
    case 'number':
      if(typeof primitive == "number") {
        rval = true;
      } else if(typeof primitive === "string"){
        if (primitive === Number(primitive).toString()) {
          rval = true;
        } else if(!isNaN(parseInt(primitive)) && Number(primitive) === parseInt(primitive)) {
          rval = true;
        }
      }
      break;
    case 'int':
      if(isType(primitive, 'number') && Number(primitive) % 1 == 0) {
        rval = true;
      }
      break;
    case 'float':
      if(isType(primitive, 'number')) {
        if(isType(primitive, 'int')) {
          rval = true;
        } else if(Number(primitive) % 1 !== 0) {
          rval = true;
        }
      }
      break;
  }

  return rval;
}

/**
 * 
 * @param {object} [data]
 * @param {boolean} [clone=false] - The original object will be cloned if true.
 * @returns {JSONObject}
 * @constructor
 */
function JSONObject(data, clone){
  if(data instanceof JSONObject) {
    return data;
  }
  
  if(typeof data === "object" && clone) {
    data = deepClone(data);
  }
  
  this.data = data || {};
  return this;
}

/**
 * Get a value from decorated object
 * @param {...*|*[]} key
 * @returns {*|{}}
 */
JSONObject.prototype.get = function() {
  var keys, current = this.data;
  
  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }
  
  if(keys.length < 1) {
    return this.object();
  }

  var i;
  for (i = 0; i < keys.length; i++){
    current = current[keys[i]];
    if(current === undefined) return;
  }
  
  return current;
};

/**
 * @alias get
 */
JSONObject.prototype.dget = function(){
  return JSONObject.prototype.get.apply(this, arguments);
};

/**
 * Get a object from decorated object
 * @param {...*|*[]} key
 * @returns {Object||{}}
 */
JSONObject.prototype.getObject = function(){
  var value = this.get.apply(this, arguments);

  if(!isType(value, 'object')) {
    throw new Error("value is not an object");
  }

  return value;
};

/**
 * Get a array from decorated object
 * @param {...*|*[]} key
 * @returns {Array}
 */
JSONObject.prototype.getArray = function(){
  var value = this.get.apply(this, arguments);

  if(!isType(value, 'array')) {
    throw new Error("value is not an array");
  }

  return value;
};

/**
 * Get a string from decorated object
 * @param {...*|*[]} key
 * @returns {String}
 */
JSONObject.prototype.getString = function(){
  var value = this.get.apply(this, arguments);

  if(!isType(value, 'string')) {
    throw new Error("value is not a string");
  }

  return value;
};

/**
 * Get a integer from decorated object
 * @param {...*|*[]} key
 * @returns {Number}
 */
JSONObject.prototype.getInt = function(){
  var value = this.get.apply(this, arguments);

  if(!isType(value, 'number')) {
    throw new Error("value is not a number");
  }

  return parseInt(value);
};

/**
 * Get a float from decorated object
 * @param {...*|*[]} key
 * @returns {Number}
 */
JSONObject.prototype.getFloat = function(){
  var value = this.get.apply(this, arguments);

  if(!isType(value, 'number')) {
    throw new Error("value is not a number");
  }

  return parseFloat(value);
};

/**
 * Get a decorated JSONObject from decorated object
 * @param {...*|*[]} key
 * @returns {JSONObject}
 */
JSONObject.prototype.getDecoratedObject = function(){
  var value = this.getObject.apply(this, arguments);
  return new JSONObject(value);
};

/**
 * Get a decorated JSONArray from decorated object
 * @param {...*|*[]} key
 * @returns {JSONArray}
 */
JSONObject.prototype.getDecoratedArray = function(){
  var value = this.getArray.apply(this, arguments);
  return new JSONArray(value);
};

/**
 * Update a value inside the decorated object
 * @param {...*|*[]} key
 * @param value
 * @returns {JSONObject}
 */
JSONObject.prototype.put = function(key, value) {
  var keys, current = this.data;
  
  if(arguments.length < 2) {
    throw new Error("put needs at least 2 arguments");
  }
  
  value = arguments[arguments.length - 1];
  
  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
    keys.pop();
  }

  var i, k;
  for (i = 0; i < keys.length; i++){
    k = keys[i];
    if(current[k] === undefined) {
      current[k] = {};
    }
    
    if((keys.length - 1) == i) {
      current[k] = value;
    }
    
    current = current[k];
  }

  return this;
};

/**
 * @alias put
 */
JSONObject.prototype.dput = function(){
  return JSONObject.prototype.put.apply(this, arguments);
};


JSONObject.prototype.delete = function(){
  var keys, current = this.data;

  if(arguments.length < 1) {
    throw new Error("delete needs at least 1 arguments");
  }

  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }

  var i, last;
  for (i = 0; i < keys.length; i++){
    last = current;
    current = current[keys[i]];
    if(current === undefined) return;
  }

  delete last[keys[i-1]];
  return current;
};

JSONObject.prototype.del = function(){
  return JSONObject.prototype.delete.apply(this, arguments);
};

/**
 * Return a reference to internal object
 * @returns {object}
 */
JSONObject.prototype.object = function(){
  return this.data;
};

/**
 * Return a shallow copy of internal object
 * @returns {*}
 */
JSONObject.prototype.shallowClone = function(){
  return clone(this.object());
};

/**
 * Deep clone an internal object
 * @returns {object}
 */
JSONObject.prototype.clone = function(){
  return this.deepClone();
};

/**
 * Deep clone an internal object
 * @returns {object}
 */
JSONObject.prototype.deepClone = function(){
  return deepClone(this.object());
};

/**
 * Return a copy of JSONObject instance
 * @returns {JSONObject}
 */
JSONObject.prototype.decoratedClone = function(){
  var data = this.deepClone();
  return new JSONObject(data);
};

/**
 * @alias decoratedClone
 */
JSONObject.prototype.copy = function(){
  return this.decoratedClone.call(this);
};

/**
 * Get an object with given keys or initialize and return empty object
 * @param {(...string|string[])} key
 * @returns {object|{}}
 * @throws {TypeError} if value is not an object
 */
JSONObject.prototype.getOrCreateObject = function(){
  var keys;
  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }

  var value = this.get(keys);
  
  if(!value) {
    this.put(keys, {});
    return this.get(keys);
  } else {
    if(Array.isArray(value)) {
      throw new TypeError("value found with " + keys.join(', ') + " was an array!");
    } else if(typeof value === "object") {
      return value;
    } else {
      throw new TypeError("value found with " + keys.join(', ') + " was not an object!");
    }
  }
};

/**
 * Get an decorated JSONObject with given keys or initialize and return empty JSONObject
 * @param {(...string|string[])} key
 * @returns {JSONObject|{}}
 * @throws {TypeError} if value is not an object
 */
JSONObject.prototype.getOrCreateDecoratedObject = function(){
  var obj = this.getOrCreateObject.apply(this, arguments);
  return new JSONObject(obj);
};

/**
 * Get an array with given keys or initialize and return empty array
 * @returns {Array|[]}
 * @throws {TypeError} if value is not an array
 */
JSONObject.prototype.getOrCreateArray = function(){
  var keys;
  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }

  var value = this.get(keys);

  if(!value) {
    this.put(keys, []);
    return this.get(keys);
  } else {
    if(Array.isArray(value)) {
      return value;
    } else {
      throw new TypeError("value found with " + keys.join(', ') + " was not an array!");
    }
  }
};

/**
 * Get an decorated JSONArray with given keys or create new
 * @returns {JSONArray}
 * @throws {TypeError} if value is not an array
 */
JSONObject.prototype.getOrCreateDecoratedArray = function(){
  var arr = this.getOrCreateArray.apply(this, arguments);
  return new JSONArray(arr);
};

/**
 * Return list of keys available in decorated JSONObject
 * @returns {Array}
 */
JSONObject.prototype.keys = function(){
  return Object.keys(this.data);
};

/**
 * Return decorate JSONArray
 * @param arr
 * @constructor
 */
function JSONArray(arr) {
  this.arr = arr || [];
};

/**
 * Return return original array
 * @returns {Array|[]}
 */
JSONArray.prototype.array = function(){
  return this.arr;
};

/**
 * Return original array or item in given index
 * @param [idx]
 * @returns {*}
 */
JSONArray.prototype.get = function(idx){
  var arr = this.arr;
  if(idx !== undefined) {
    return arr[idx];
  }
  return this.arr;
};

/**
 * Return decorated JSONObject from given index
 * @param idx
 * @returns {JSONObject}
 */
JSONArray.prototype.getObject = function(idx){
  var raw = this.get(idx);
  return new JSONObject(raw);
};

/**
 * Return array containing decorated JSONObjects
 * @returns {Array}
 */
JSONArray.prototype.objects = function(){
  return this.arr.map(function(item){
    return new JSONObject(item);
  });
};


module.exports = {
  /**
   * Clone given object and decorate it
   * @param {object} object
   * @returns {JSONObject}
   */
  decoratedCopy: function(object){
    return new JSONObject(object, true);
  },

  /**
   * Decorate object
   * @param {object} [object]
   * @returns {JSONObject}
   */
  decorate: function(object){
    if(Array.isArray(object)) {
      return new JSONArray(object);
    }
    return new JSONObject(object);
  },

  /**
   * Return empty decorated object
   * @returns {JSONObject}
   */
  object: function(){
    return new JSONObject();
  },

  /**
   * Return empty decorated array
   * @returns {JSONArray}
   */
  array: function(){
    return new JSONArray();
  },

  /**
   * Check primitive type
   * @param primitive
   * @param {string} type -- array|object|string|number|int|float
   * @returns {boolean}
   */
  is: isType,
  
  JSONObject: JSONObject,
  JSONArray: JSONArray,

  utils: {
    clone: clone,
    deepClone: deepClone,
    deepMerge: deepMerge,
    extend: extend,
    isType: isType
  }
};
