def('unit:test',
['oop', 'unit:core:log-writer', 'risc.core.error', 'utils:each'],
function(oop, writer, errors, each){
    // Logger
    var Logger = function(config){
        oop.ext(this, config);
        this.logLevel = this.logLevel || Logger.LEVELS['warning'];
    };

    Logger.LEVELS = {
        "success": -1,
        "error": 0,
        "info": 1,
        "warning": 2,
        "debug": 3,
        "trace": 4
    };

    Logger.EXTRA_STYLE = {
        "0": "out-error",
        "2": "out-warn",
        "3": "out-debug",
        "4": "out-trace",
        "-1": "out-success"
    };

    oop.ext(Logger, {
        _log: function(message, level){
            if(this.logLevel >= level){
                this._write(message, level);
            }
        },
        _write: function(message, level){
            writer.writeLn(message, Logger.EXTRA_STYLE[level]);
        },
        setLevel: function(logLevel){
            this.logLevel = Logger.LEVELS[logLevel];
        }
    });

    each(Logger.LEVELS, function(value, level){
        var ex = {};
        ex[level] = function(){
            var message = Array.prototype.join.call(arguments, '');
            this._log(message, value);
        };
        oop.ext(Logger, ex);
    });

    var TestRunner = function(config){
        oop.ext(this, config);
        this.suites = {
            inOrder: [],
            all: {}
        };
        this.log = new Logger({});
    };

    oop.ext(TestRunner, {
        addSuite: function(suiteName, description, suite,
            testSetup, testTeardown, stopOnError){
            var testSuite = new TestSuite({
                name: suiteName,
                description: description,
                testSetup: testSetup,
                testTearDown: testTeardown,
                stopOnError: stopOnError,
                log: this.log
            });
            var defineTest = function(testName, description, testCase,
                setup, tearDown, context){
                testSuite.addTestCase(testName, description, testCase, setup,
                    tearDown, context);
            };
            suite.call(testSuite, defineTest);
            this.suites.inOrder.push(suiteName);
            this.suites.all[suiteName] = testSuite;
        },
        getSuite: function(suiteName){
            return this.suites.all[suiteName];
        },
        runSuite: function(suiteName){
            var suite = this.getSuite(suiteName);
            if(!suite){
                this.log.error('Invalid suite: ', suiteName);
                throw new Error('Invalid suite: ' + suiteName);
            }
            this._runSuite(suite);
        },
        _runSuite: function(suite){
            this.log.info(' ** ', suite.name, ' ** ');
            this.log.info('++++++++++++++++++++++++++++++++++++++++++++++++++');
            this.log.info(suite.description);
            this.log.info('\n');
            suite.runAll();
            this.log.info('\n');
        },
        runAll: function(){
            each(this.suites.inOrder, function(suite){
                this._runSuite(this.suites.all[suite]);
            }, this);
        }
    });

    var TestSuite = function(config){
        oop.ext(this, config);
        this.tests = {
            inOrder: [],
            all: {}
        };
        this.report = new Report();
    };

    oop.ext(TestSuite, {
        addTestCase: function(testCaseName, description, testCase,
            setup, tearDown, context){
            var test = new TestCase({
                name: testCaseName,
                description: description,
                testCase: testCase,
                log: this.log,
                setup: setup || this.testSetup || function(){},
                tearDown: tearDown || this.testTearDown || function(){},
                testContext: context
            });
            this.tests.inOrder.push(testCaseName);
            this.tests.all[testCaseName] = test;
        },
        getTest: function(name){
            return this.tests.all[name];
        },
        runTest: function(testCaseName){
            var report = new Report();
            try{
                this._runTestWithReport(testCaseName, report, 1);
            }catch(e){

            }
            this._printSummary(report);
            return report;
        },
        _printSummary: function(report){
            var l = this.log, s = report.getStatistics();
            l.info('\nSummary:');
            l.info(' Total tests run: ', s.total);
            l.info(' - passed: ', s.passed);
            l.info(' - failed: ', s.failed);
            l.info('--------------------------------------------------');
            l.info('\n');
        },
        _runTestWithReport: function(testCaseName, report, cnt){
            var test = this.getTest(testCaseName);
            if(!test){
                this.log.error('No such test: ', testCaseName);
                throw new errors.BaseError('No such test: ' + testCaseName);
            }
            this.log.info('(',cnt,')', 'Running test: ', testCaseName);
            this.log.info('--------------------------------------------------');
            this.log.info('\t', test.description);
            this.log.info('-------------------------------------------------');
            try{
                test.run();
                report.testSuccess(testCaseName);
                this.log.success('STATUS: PASSED\n');
            }catch(e){
                report.testFailed(testCaseName, e);
                this.log.error('STATUS: FAILED\n');
                if(this.stopOnError){
                    throw e;
                }
            }
            this.log.info('\n');
        },
        runAll: function(){
            var report = new Report();
            try{
                each(this.tests.inOrder, function(testName, k, cnt){
                    this._runTestWithReport(testName, report, cnt+1);
                }, this);
            }catch(e){

            }
            this._printSummary(report);
            return report;
        }
    });

    var TestCase = function(config){
        oop.ext(this, config);
    };

    oop.ext(TestCase, {
        run: function(){
            var self = this;
            var assert = function(value, errorMessage) {
                if(!value){
                    self.reportError(errorMessage);
                    throw new errors.BaseError('Assert failed: ' + errorMessage);
                }
            };

            var expect = function(expected, actual, message){
                assert(expected == actual, 'Expected [' + expected +
                    '] but got [' + actual + '] instead. ' + (message || ''))
            };

            try{
                var log = new Logger({
                  logLevel: this.log ? this.log.logLevel: Logger.LEVELS['warning']
                });
                this.setup.call(this.testContext, assert, log, expect);
                this.testCase.call(this.testContext, assert, log, expect);
                this.tearDown.call(this.testContext, assert, log, expect);
            }catch(e){
                self.reportError(e.message, new errors.BaseError(e.message, e));
                throw new errors.BaseError('Unexpected error: ' + e.message);
            }
        },
        reportError: function(errorMsg, err){
            this.log.error(errorMsg);
            if(err){
                this.log.error('Error: ', err.message);
                this.log.error('Stack trace: ', err.fullStackTrace ?
                        err.fullStackTrace():err.stack);
            }
        }
    });

    var Report = function(){
        this.tests = {};
        this.testsInOrder = [];
        this.stats = {
            passed: 0,
            failed: 0
        };
    };

    oop.ext(Report, {
        _getTestStats: function(testName){
            if(!this.tests[testName]){
                this.tests[testName] = {
                    success: false,
                    message : ''
                };
                this.testsInOrder.push(testName);
            }
            return this.tests[testName];
        },
        testSuccess: function(testName){
            this._getTestStats(testName).success = true;
            this.stats.passed++;
        },
        testFailed: function(testName, error){
            var testStats = this._getTestStats(testName);
            testStats.success = false;
            testStats.error = error;
            this.stats.failed++;
        },
        getStatistics: function(){
            return {
                passed: this.stats.passed,
                failed: this.stats.failed,
                total: this.stats.passed+this.stats.failed,
                details: (function(r){
                    var details = [];
                    each(r.testsInOrder, function(testName){
                        var err = r.tests[testName].error;
                        details.push({
                            passed: r.tests[testName].status,
                            message: err ? err.message : '',
                            error: err
                        });
                    });
                    return details;
                })(this)
            };
        }
    });

    // the default test runner and shortcuts
    var __defaultRunner = new TestRunner({

    });
    // $(document).ready(function(){
    //     __defaultRunner.runAll();
    // });
    var defineSuite = function(suiteName, description,
        theSuite, commonSetup, commonTearDown, stopOnError){
            __defaultRunner.addSuite(suiteName, description,
        theSuite, commonSetup, commonTearDown, stopOnError);
    };

    def('unit:test:suite', [], function(){ return defineSuite; });
    def('unit:test:runner',[], function(){ return __defaultRunner; });

    return {
      Logger: Logger,
      TestRunner: TestRunner,
      TestSuite: TestSuite,
      TestCase: TestCase,
      Report: Report
    };
});
