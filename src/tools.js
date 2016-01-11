(function(){

  var merge = function(a, b){
    for(var propName in b){
      if(b.hasOwnProperty(propName)){
        a[propName] = b[propName];
      }
    }
    return a;
  };

  var isFunction = function(f){
    return typeof(f) == 'function';
  };

  var extendTwo = function(a, b){
    var oa = isFunction(a) ? a.prototype : a;
    var ob = isFunction(b) ? b.prototype : b;
    merge(oa, ob);
    return a;
  };

  var extendFromClass = function(classA, superClass){
    var proto = merge(Object.create(superClass.prototype), classA.prototype);
    proto.constructor = classA;
    classA.prototype = proto;
    classA.superclass = superClass.prototype;
  };

  var extend = function(){
    if(arguments.length < 2){
      throw new Error('Too few arguments to extend!');
    }
    var first = arguments[0];
    var isClassExtend = isFunction(first);
    var superClass = null;
    for(var i = 1; i < arguments.length; i++){
      var currMixin = arguments[i];
      if(isClassExtend && !superClass && isFunction(currMixin)){
        superClass = currMixin;
      }
      first = extendTwo(first, currMixin);
    }
    if(isClassExtend && superClass){
      first = extendFromClass(first, superClass);
    }
    return first;
  };

  def(':$', [], function(){
    return jQuery;
  });
  def(':oop', [], function(){
    return {
      extend: extend,
      ext: extend
    };
  })
})();
