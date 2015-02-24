"use strict";

function JSONObject(data){
  this.data = data || {};
  return this;
}

JSONObject.prototype.get = function() {
  var keys, k, current = this.data;
  
  if(arguments[0] && Array.isArray(arguments[0])) {
    keys = arguments[0];
  } else {
    keys = Array.prototype.slice.call(arguments);
  }
  
  if(keys.length < 1) {
    return this.data;
  }

  var i;
  for (i = 0; i < keys.length; i++){
    current = current[keys[i]];
    if(current === undefined) return;
  }
  
  return current;
};


JSONObject.prototype.dget = function(){
  return JSONObject.prototype.get.apply(this, arguments);
};

JSONObject.prototype.put = function(key, value) {
  var keys, k, next, current = this.data;
  
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

JSONObject.prototype.dput = function(){
  return JSONObject.prototype.put.apply(this, arguments);
};

JSONObject.prototype.getOrCreateObject = function(){
  var keys = Array.prototype.slice.call(arguments);
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

JSONObject.prototype.getOrCreateArray = function(){
  var keys = Array.prototype.slice.call(arguments);
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

module.exports = {
  decorate: function(data){
    return new JSONObject(data);
  },
  
  object: function(){
    return new JSONObject();
  },
  
  JSONObject: JSONObject
};
