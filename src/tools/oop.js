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

  def('oop', function(){
    return {
      /**
       * Performs a classical OOP class extend.
       * When given a function as a first argument, it will be considered as a class
       * and it will be extended with the properties of the next arguments.
       * If there are no other functions given as arguments, then all other orguments
       * are considered to be mixins. This case in general is as follows:
       * <code>
       * <pre>
       * extend(SubClass:function, mixin:object [,mixin:object ...])
       * </pre>
       * </code>
       * The properties (methods) of the mixins will be merged with the SubClass prototype
       * evaulating from left to right, meaning any methods that are present in the class itself
       * or in a mixin can be overwritten by another mixin to the right of it.
       * For example:
       * <code><pre>
       *  var SubClass = function(){};
       *  extend(SubClass, {
       *  	mixin1_method: function()
       *  		// will be in the final class
       *  	},
       *  	method: function(){
       *  	  // this will be overwritten by the next mixin
       *  	}
       *  },{
       *   method: function(){
       *     // this method will be available in the final class
       *   }
       *  })
       * </pre></code>
       *
       *  If other functions are supplied to the extend
       *  function after the first class, then the first (left most after the first argument)
       *  will be considered as the super class for extend. The general synopsis is:
       *  <code><pre>
       *  var SubClass = function(){};
       *  var SuperClass = function(){};
       *
       *  extend(SubClass, SuperClass);
       *  console.log(SubClass.superclass == SuperClass.prototype); // returns true
       *  var obj = new SubClass();
       *  console.log(obj instanceof SubClass); // true
       *  console.log(obj instanceof SuperClass); // true
       *  </pre></code>
       *  Or let's consider the following, a bit more complex example:
       *
       * <code><pre>
       * var SuperClass = function(){}; // constructor for the super class
       * extend(SuperClass, {
       *   superClassMethod: function(){}
       * });
       *
       * var SubClass = function(){}; // constructor for the sub class
       *
       * // we'll extend from the super class and add the methods for the sub class:
       * extend(SubClass, SuperClass, {
       *   subClassMethod: function(){} // this is the sub class method
       * });
       *
       * var obj = new SubClass();
       *
       * console.log(obj.superClassMethod !== undefined); // true, inherited from super class
       * console.log(obj.subClassMethod !== undefined); // true, from the sub class definition
       * </pre></code>
       *
       * When we extend a class with another class, a special property called <code>superclass</code> is
       * attached to the class itself. This points to the super class prototype, so we can easily access the
       * methods or properties available in the super class (or methods that we have overriden in the sub class).
       * For example, here is how we can call a super method from a child class:
       * <code><pre>
       * var A = function(){
       *   console.log('A constructor call');
       * };
       *
       * extend(A, {
       *   method: function(value){
       *     console.log('A.method() call with value: ', value)
       *   }
       * });
       *
       * var B = function(){
       *   // call to the super constructor
       *   B.superclass.constructor.call(this);
       *   console.log('B constructor call')
       * };
       *
       * extend(B, A, {
       *   otherMethod: function(){
       *     // a call to a super class mathod with value
       *   	 B.superclass.method.call(this, 'some value');
       *   	 console.log('B.otherMethod() call')
       *   }
       * });
       *
       * var b = new B(); // Console will log:
       * // A constructor call
       * // B constructor call
       *
       * b.otherMethod(); // will log:
       * // A.method() call with value: some value
       * // B.otherMethod() call
       *
       * </pre></code>
       * Note that when calling the super class methods, we do it by calling the
       * special method <code>Function.call()</code>. We do this to set the funcion
       * <code>this</code> to point to the proper object.
       *
       * Another usage of the <code>extend</code> function is to merge two or more
       * objects. This happens if you provide the function with an object that is not
       * a funcion as a first argument. In that case, no OOP class extend will be atempted.
       */
      extend: extend,
      /**
       * An alias for extend
       */
      ext: extend,
      merge: merge
    };
  });


})();
