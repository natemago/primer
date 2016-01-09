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

    });


  });
})();
