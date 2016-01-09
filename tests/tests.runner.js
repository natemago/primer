def('_testsRunner', ['unit:test:runner', 'unit:test:suite'], function(mainTestRunner, suite){

  mainTestRunner.runAll();

});
