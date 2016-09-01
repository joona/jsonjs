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

function keysFromArguments() {
  var keys = [];
  if(arguments[0] && isType(arguments[0], 'array')) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }
  return keys;
}

function isTypeStrict(primitive, type, name) {
  var rval = isType(primitive, type);
  if(!rval) {
    throw new Error('jsonjs validation error: ' + (name ? name : 'primitive') + ' is not a(n)' + type);
  }
}

function isType(primitive, type) {
  var rval = false;

  switch(type) {
    case 'primitive':
      return isType(primitive, 'string') || isType(primitive, 'number') || isType(primitive, 'boolean');

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
      if(isType(primitive, 'number') && Number(primitive) % 1 === 0) {
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
    case 'boolean':
      if(typeof primitive == "boolean") {
        rval = true;
      }
      break;
  }

  return rval;
}

function isDecoratedObject(object) {
  return !!(object instanceof JSONObject);
}

function isDecoratedArray(array) {
  return !!(array instanceof JSONArray);
}

function isDecorated(object) {
  return isDecoratedArray(object) || isDecoratedObject(object);
}

function _flatten(element, delimiter, pathPrefix) {
  delimiter || (delimiter = '.');
  pathPrefix || (pathPrefix = '');
  var paths = [];
  if(isType(element, 'object')) {
    if(!isDecoratedObject(element)) {
      element = new JSONObject(element); 
    }  

    var keys = element.keys();
    var keysLength = keys.length;
    for(var i = 0; i < keysLength; i++) {
      var key = keys[i];
      var val = element.get(key);

      if(isType(val, 'primitive')) {
        paths.push([pathPrefix + key, val]);
      } else if(isType(val, 'array') || isType(val, 'object')) {
        paths = paths.concat(_flatten(val, delimiter, pathPrefix + key + delimiter));
      } else {
        throw new Error('Unknown type for key:' + pathPrefix + key);
      }
    }
  } else if(isType(element, 'array')) {
    if(isDecoratedArray(element)) {
      element = element.data;
    }

    var len = element.length;
    for(var i = 0; i < len; i++) {
      var val = element[i];

      if(isType(val, 'primitive')) {
        paths.push([pathPrefix + i, val]);
      } else if(isType(val, 'array') || isType(val, 'object')) {
        paths = paths.concat(_flatten(val, delimiter, pathPrefix + i + delimiter));
      } else {
        throw new Error('Unknown type for key:' + pathPrefix + i);
      }
    }
  } else {
    throw new Error('Unknown type. Expecting an array or an object');
  }

  return paths;
}

function flatten(element, delimiter) {
  var flatMap = {};
  var items = _flatten(element, delimiter);
  var len = items.length;

  for(var i = 0; i < len; i++) {
    var k = items[i][0];
    var v = items[i][1];
    flatMap[k] = v;
  }

  return flatMap;
}

function unflatten(element, delimiter) {
  delimiter || (delimiter = '.');
  var keys = Object.keys(element);
  var len = keys.length;

  var obj = new JSONObject();
  for(var i = 0; i < len; i++) {
    var key = keys[i];
    var keyArray = key.split(delimiter);

    //if(isType(keyArray[keyArray.length - 1], 'number')) {
    //  var idx = keyArray.pop();
    //  var arr = obj.getOrCreateArray(keyArray)[idx] = element[key];
    //} else {
      obj.put(keyArray, element[key]);
    //}
  }

  return obj;
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
 * Check if key has a value
 * @param {...String|String[]} key
 * @returns {boolean}
 */
JSONObject.prototype.has = function() {
  var keys = keysFromArguments.apply(this, arguments), current = this.data;

  if(keys.length < 1) {
    return true;
  }

  var value = this.get(keys);
  if(value !== undefined) {
    return true;
  }

  return false;
};


/**
 * Check if value with key is a given type
 * @param {...String|String[]} key
 * @param {String} type
 * @returns {boolean}
 */
JSONObject.prototype.is = function() {
  var keys = keysFromArguments.apply(this, arguments);
  var type = keys.pop();

  var value = this.get(keys);
  return isType(value, type);
};

/**
 * Get a value from decorated object
 * @param {...*|*[]} key
 * @returns {*|{}}
 */
JSONObject.prototype.get = function() {
  var keys = keysFromArguments.apply(this, arguments), current = this.data;

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
  isTypeStrict(value, 'object', 'value');
  return value;
};

/**
 * Get a array from decorated object
 * @param {...*|*[]} key
 * @returns {Array}
 */
JSONObject.prototype.getArray = function(){
  var value = this.get.apply(this, arguments);
  isTypeStrict(value, 'array', 'value');
  return value;
};

/**
 * Get a string from decorated object
 * @param {...*|*[]} key
 * @returns {String}
 */
JSONObject.prototype.getString = function(){
  var value = this.get.apply(this, arguments);
  isTypeStrict(value, 'string', 'value');
  return value;
};

/**
 * Get a boolean from decorated object
 * @param {...*|*[]} key
 * @returns {Boolean}
 */
JSONObject.prototype.getBoolean = function(){
  var value = this.get.apply(this, arguments);
  isTypeStrict(value,  'boolean', 'value');
  return value;
};

/**
 * Get a integer from decorated object
 * @param {...*|*[]} key
 * @returns {Number}
 */
JSONObject.prototype.getInt = function(){
  var value = this.get.apply(this, arguments);
  isTypeStrict(value, 'number', 'value');
  return parseInt(value);
};

/**
 * Get a float from decorated object
 * @param {...*|*[]} key
 * @returns {Number}
 */
JSONObject.prototype.getFloat = function(){
  var value = this.get.apply(this, arguments);
  isTypeStrict(value, 'number', 'value');
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

  var args = Array.prototype.slice.call(arguments);
  value = args.pop();
  keys = keysFromArguments.apply(this, args);

  var i, k;
  for (i = 0; i < keys.length; i++){
    k = keys[i];

    if(isType(keys[i+1], 'number')) {
      if(current[k] === undefined) {
        current[k] = [];
      }

    } else {
      if(current[k] === undefined) {
        current[k] = {};
      }
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

  keys = keysFromArguments.apply(this, arguments);

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
  var keys = keysFromArguments.apply(this, arguments);
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
  var keys = keysFromArguments.apply(this, arguments);
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
}

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
 * Return object from given index
 * @param idx
 * @returns {JSONObject}
 */
JSONArray.prototype.getObject = function(idx){
  var raw = this.get(idx);
  isTypeStrict(raw, 'object');
  return raw;
};

/**
 * Return decorated JSONObject from given index
 * @param idx
 * @returns {JSONObject}
 */
JSONArray.prototype.getDecoratedObject = function(idx) {
  return new JSONObject(this.getObject(idx));
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

/**
 * Push item to JSONArray. Returns index of the item.
 * @param item
 * @returns {int}
 */
JSONArray.prototype.push = function(item){
  return this.arr.push(item);
};

JSONArray.prototype.getArray = function(idx){
  var item = this.get(idx);
  isTypeStrict(item, 'array');
  return item;
};

JSONArray.prototype.getDecoratedArray = function(idx){
  return new JSONArray(this.getArray(idx));
};

/**
 * Return size of the array.
 * @returns {int}
 */
JSONArray.prototype.size = function(){
  return this.arr.length;
};

module.exports = {
  /**
   * Clone given object and decorate it
   * @param {object} object
   * @returns {JSONObject}
   * @static
   */
  decoratedCopy: function(object){
    return new JSONObject(object, true);
  },

  /**
   * Decorate object
   * @param {object|JSONObject|JSONArray} [object]
   * @returns {JSONObject|JSONArray}
   * @static
   */
  decorate: function(object){
    if(isDecorated(object)) {
      return object;
    }
    if(Array.isArray(object)) {
      return new JSONArray(object);
    }
    return new JSONObject(object);
  },

  /**
   * Return empty decorated object
   * @returns {JSONObject}
   * @static
   */
  object: function(){
    return new JSONObject();
  },

  /**
   * Return empty decorated array
   * @returns {JSONArray}
   * @static
   */
  array: function(){
    return new JSONArray();
  },

  /**
   * Check primitive type
   * @param primitive
   * @param {string} type -- array|object|string|number|int|float
   * @returns {boolean}
   * @static
   */
  is: isType,

  /**
   * Check primitive type or throw
   * @param primitive
   * @param {string} type -- array|object|string|number|int|float
   * @param {string} [name] primitive name
   * @throws {Error}
   * @static
   */
  isStrictly: isTypeStrict,

  JSONObject: JSONObject,
  JSONArray: JSONArray,

  isDecoratedObject: isDecoratedObject,
  isDecoratedArray: isDecoratedArray,
  isDecorated: isDecorated,

  /**
   *
   */
  utils: {
    /**
     * Clone an object
     * @param {object} obj
     * @type {Function}
     * @returns {object}
     * @static
     */
    clone: clone,

    /**
     * Deep clone an object
     * @param {object} obj
     * @type {Function}
     * @returns {object}
     * @static
     */
    deepClone: deepClone,

    /**
     * Deep merge one object to another
     * @param one
     * @param another
     * @type {Function}
     * @returns {object}
     * @static
     */
    deepMerge: deepMerge,

    /**
     * Deep merge multiple objects. First being the base.
     * @param {object} ...obj
     * @type {Function}
     * @returns {object}
     * @static
     */
    extend: extend,

    /**
     * Check primitive type
     * @param primitive
     * @param {string} type -- array|object|string|number|int|float
     * @type {Function}
     * @returns {boolean}
     * @static
     */
    isType: isType,

    /**
     * Check primitive type or throw
     * @param primitive
     * @param {string} type -- array|object|string|number|int|float
     * @param {string} [name] primitive name
     * @type {Function}
     * @throws {Error}
     * @static
     */
    isTypeStrict: isTypeStrict,

    /**
      * Flatten object or array to key value pairs
      * @param element
      * @param {string} [delimiter] -- Delimiter for nested keys. Defaults to '.'
      * @static
      * @returns {object}
      */

    flatten: flatten,

    /**
      * Create nested object from key paths and values
      * @param {object} paths
      * @param {string} [delimiter] -- Key delimiter on paths. Defaults to '.'
      * @static
      * @returns {JSONObject} 
      */

    unflatten: unflatten
  }
};
