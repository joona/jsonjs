module.exports = {
  "decorate":function(d) {
    decorated={"data":d};

    decorated['dget']=function() {
      if(arguments.length == 0) {
        throw error("dget must have at least 1 argument");
      }
      var current=d;
      for (i = 0; i < arguments.length; i++) {
        current=current[arguments[i]];
        if(current==null) return;
      }
      return current;
    };

    decorated['dput']=function() {
      if(arguments.length <= 1) {
        throw error("dput must have at least 2 arguments");
      }
      var current=d;
      var next;
      for (i = 0; i < arguments.length-2; i++) {
        next=current[arguments[i]];
        if(next==null) {
          current[arguments[i]]={};
        }
        current=current[arguments[i]];
      }
      current[arguments[arguments.length-2]]=arguments[arguments.length-1];
    };

    return decorated;
  },
  "object":function() {
    return this.decorate({})
  }
}
