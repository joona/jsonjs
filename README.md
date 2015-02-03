# Introduction

This library is inspired by [jsonj](https://github.com/jillesvangurp/jsonj), the java library for parsing and manipulating json structures in java that we developed at [Inbot](http://inbot.io). While javascript of course supports json natively, it misses a few of the features present in jsonj. This small library attempts to rectify this.

## Install

```
$ npm install jsonjs
```

## Usage

Some examples from the included tests:

```javascript

var expect=require('chai').expect;
var jsonjs=require('../jsonjs');

describe('use jsonjs to decorate objects', function() {
  it('should create decorated object that wraps original', function() {
    var obj={"foo":42};
    var dobj=jsonjs.decorate(obj);
    console.log(obj);
  })

  it('should add smart get to object', function() {
    var obj={
      "foo":42,
      "a":{
        "b":42,
        "c":[1,{"two":{"three":"four"}}]
      }
    };
    var dobj=jsonjs.decorate(obj);
    expect(dobj.dget('a','b')).to.equal(42);
    expect(dobj.dget('i','dont','exist')).to.be.undefined;
    expect(dobj.dget('a','c',0)).to.equal(1);
    expect(dobj.dget('a','c',1,'two','three')).to.equal('four');
  });

  it('should put stuff deep into an object', function() {
    var obj={};
    var dobj=jsonjs.decorate(obj);
    dobj.dput('a','b','c','d')
    expect(dobj.dget('a','b','c')).to.equal('d');
  });

  it('should manipulate decorated object and access it', function() {
    var obj={};
    var dobj=jsonjs.decorate(obj);
    dobj.dput('a','b','c','d')
    expect(dobj.dget('a','b','c')).to.equal('d');
    expect(dobj.data['a']['b']['c']).to.equal('d');
    expect(obj['a']['b']['c']).to.equal('d');
  });

  it('should create decorated object', function() {
    var dobj=jsonjs.object();
    dobj.dput('a','b','c','d')
    expect(dobj.dget('a','b','c')).to.equal('d');
  });
});

```
