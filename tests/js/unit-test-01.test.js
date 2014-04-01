def('unit-test.test',
['unit:core:log-writer'],
function(writer){
    w = writer;
});

def('unit-test.test.suite', ['unit:test:suite'], function(suite){
    suite('Test Suite', 'Simple test suite', function(usecase){
        usecase('Test One', 'First test', function(assert){
            assert(true, 'Yeah');
        });
        usecase('Test 2', 'Second test', function(assert, log){
            log.setLevel("trace");
            
            log.debug("test debug message");
            log.trace("some trace message here...");
            
            assert(false, 'Oops');
            
        });
    })
});
