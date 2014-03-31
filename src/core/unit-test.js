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
    
    // Test Suite
    
    // Test Case 
    
    // Asserts
});
