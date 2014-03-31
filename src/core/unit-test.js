def('unit:test',['jQuery','libDraw', 'unit:core:log-writer'], 
function($, libDraw, writer){
    // Logger
    var Logger = function(config){
        libDraw.ext(this, config);
        this.logLevel = this.logLevel || Logger.LEVELS['warning'];
    };
    
    Logger.LEVELS = {
        "error": 0,
        "info": 1,
        "warning": 2,
        "debug": 3,
        "trace": 4
    };
    
    libDraw.ext(Logger, {
        _log: function(message, level){
            if(this.logLevel >= level){
                this._write(message, level);
            }
        },
        _write: function(message, level){
            writer.writeLn(message);
        }
    });
    
    libDraw.each(Logger.LEVELS, function(level){
        var ex = {};
        ex[level] = function(){
            var message = Array.prototype.join.call(arguments, '');
            this._log(message, Logger.LEVELS[level]);
        };
        libDraw.ext(Logger, ex);
    });
    
    var TestRunner = function(config){
        libDraw.ext(this, config);
        this.suites = {
            inOrder: [],
            all: {}
        };
        
    };
    
    libDraw.ext(TestRunner, {
        addSuite: function(suiteName, description, suite, testSetup, testTeardown){
        
        },
        getSuite: function(suiteName){
        },
        runSuite: function(suiteName){},
        runAll: function(){}
    });
    
    var TestSuite = function(config){
        libDraw.ext(this, config);    
    };
    
    libDraw.ext(TestSuite, {
        addTestCase: function(testCaseName, description, testCase){},
        getTest: function(name){
        
        },
        runTest: function(testCaseName){
        
        }
    });
    
    var TestCase = function(config){
        libDraw.ext(this, config);
    };
    
    libDraw.ext(TestCase, {
        run: function(){
            var self = this;
            var assert = function( value, errorMessage) {
                if(!value){
                    self.reportError(errorMessage);
                    throw new Error('Assert failed: ' + errorMessage);
                }
            };
            try{
                this.testCase.call(this.testContext, assert, this.logger);
            }catch(e){
                
            }
        },
        reportError: function(errorMsg){
            
        }
    });
    
    var Report = function(){};
    
    libDraw.ext(Report, {
        testSuccess: function(testName){},
        testFailed: function(testName, message){}
        getStatistics: function(){}
    });
});
