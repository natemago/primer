(function(){

  def('tools.test', ['unit:test:suite', ':$', ':oop'], function(suite, $, oop){
    console.log('tools.test');
    suite('Primer Tools - OOP', 'Tests for the tools module - OOP utilities', function(usecase){
      usecase('Define class', 'Test define a class with methods', function(ok, log, expect){
        var ClassA = function(){};
        oop.ext(ClassA, {
          method: function(){
            return 'ClassA.method()';
          }
        });

        ok(ClassA.prototype.method, 'Method not found in class prototype');

        var objA = new ClassA();

        ok(objA.method, 'Method should be present in the class instance');

        expect(objA.method(), 'ClassA.method()');

      });

      usecase('Inheritance', 'Inherit superclass method', function(ok, log, expect){
        var ClassA = function(){};
        oop.ext(ClassA, {
          classAMethod: function(){
            return "ClassA.classAMethod()";
          }
        });

        var ClassB = function(){};
        oop.extend(ClassB, ClassA);

        ok(ClassB.prototype.classAMethod, 'ClassA method should be available in prototype');
        expect(ClassB.superclass, ClassA.prototype, 'Classb superclass should point to ClassA prototype')

        var objB = new ClassB();
        expect(objB.classAMethod(), 'ClassA.classAMethod()');

      });

      usecase('Inheritance - Opetimizations', 'Optimization tests', function(ok, log, expect){
        var ClassA = function(){};

        var ClassB = function(){};

        ClassB.prototype = Object.create(ClassA.prototype);
        ClassB.prototype.constructor = ClassB;

        var objB = new ClassB();
        ok(objB instanceof ClassB);
        ok(objB instanceof ClassA);


      });

      usecase('Inheritance - Optimization - inherit methods', 'Optimization tests: inherit methods properly', function(ok, log, expect){
        var mixin = function(a, b){
          for(var p in b){
            if(b.hasOwnProperty(p)){
              a[p] = b[p];
            }
          }
          return a;
        };
        var ClassA = function(){};

        ClassA.prototype.method1 = function(){
          return 'ClassA.method1';
        };

        ClassA.prototype.forOverride = function(){
          return 'ClassA.forOverride';
        };

        var ClassB = function(){};
        ClassB.prototype.method2 = function(){
          return 'ClassB.method2';
        };

        ClassB.prototype.forOverride = function(){
          return 'Override from class B';
        };

        var proto = Object.create(ClassA.prototype);
        proto = mixin(proto, ClassB.prototype);
        proto.constructor = ClassB;

        ClassB.prototype = proto;

        var objB = new ClassB();
        ok(objB instanceof ClassB);
        ok(objB instanceof ClassA);

        ok(objB.method1);
        expect(objB.method1(), 'ClassA.method1');

        ok(objB.method2, 'Method missing');
        ok(objB.method2(), 'ClassB.method2');

        ok(objB.forOverride);
        ok(objB.forOverride(), 'Override from class B')
      });


    });


  });
})();
