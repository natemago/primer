(function(){

  def('tools.test', ['unit:test:suite', ':$', ':oop'], function(suite, $, oop){
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

      usecase('OOP Inheritance: inherit from class', 'Inherit from class and instanceof', function(ok, log, expect){
        var A = function(){};
        var B = function(){};

        oop.extend(B, A);
        var b = new B();

        ok(b instanceof B, 'Should be instance of B');
        ok(b instanceof A, 'Should be instance of A');
        ok(b instanceof Object, 'Should be instance of Object');
      });

      usecase('OOP Inheritance: inherit methods and override', 'OOP Inheritance: inherit methods and override', function(ok, log, expect){
        var A = function(){};
        var B = function(){};

        oop.extend(A, {
          method: function(){
            return 'A';
          },
          inherited: function(){
            return 'A';
          }
        });

        oop.extend(B, A,{
          fromB: function(){
            return 'B';
          },
          method: function(){
            return 'B';
          }
        })

        var b = new B();

        ok(b instanceof B, 'Should be instance of B');
        ok(b instanceof A, 'Should be instance of A');
        ok(b instanceof Object, 'Should be instance of Object');

        ok(b.fromB, 'Should have its own method');
        expect(b.fromB(), 'B');

        ok(b.inherited, 'Should have the inherited method');
        expect(b.inherited(), 'A');

        ok(b.method, 'Should have the overriden method');
        expect(b.method(), 'B');

      });

      usecase('OOP mixins basic', 'Just add mixins', function(ok, log, expect){
        var A = function(){};
        var mixin1 = {
          mixin1: function(){
            return 'M1';
          }
        };
        var mixin2 = {
          mixin2: function(){
            return 'M2';
          }
        };
        var mixin3 = {
          mixin3: function(){
            return 'M3';
          }
        };
        oop.extend(A, mixin1, mixin2, mixin3);

        var a = new A();

        ok(a.mixin1, 'Should have mixin 1');
        expect(a.mixin1(), 'M1');

        ok(a.mixin2, 'Should have mixin 2');
        expect(a.mixin2(), 'M2');

        ok(a.mixin3, 'Should have mixin 3');
        expect(a.mixin3(), 'M3');

      });

      usecase('OOP mixins complex', 'More than 1 mixin and a superclass', function(ok, log, expect){
        var SubClass = function(){};
        var SuperClass = function(){};

        oop.extend(SuperClass, {
          superClassMethod: function(){
            return 'SuperClass';
          }
        });

        var MixinClass = function(){};
        oop.extend(MixinClass, {
          mixinClassMethod: function(){
            return 'MixinClass';
          }
        });

        oop.extend(SubClass, {
          methodInSubClass: function(){
            return 'SubClass';
          }
        }, SuperClass, {
          mixin1: function(){
            return 'mixin1';
          }
        }, {
          mixin2: function(){
            return 'mixin2';
          }
        }, MixinClass,{
          mixin3: function(){
            return 'mixin3';
          }
        });

        var a = new SubClass();

        ok(a instanceof SubClass, 'Should be SubClass instance');
        ok(a instanceof SuperClass, 'Should be SuperClass instance')
        ok(!(a instanceof MixinClass), 'Should not be instance of MixinClass');

        ok(a.methodInSubClass, 'Should have its own methods');
        ok(a.superClassMethod, 'Should have the super class methods');
        ok(a.mixinClassMethod, 'Should have the mixin class methods');
        ok(a.mixin1, 'Should have the inline mixin 1 methods');
        ok(a.mixin2, 'Should have the inline mixin 2 methods');
        ok(a.mixin3, 'Should have the inline mixin 3 methods');

      });

    });
  });
})();
