def('risc.core.UnitTest',['jQuery','libDraw'], function(){
    // Logger
    var Logger = function(config){
        libDraw.ext(this, config);
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
        }
    });
    // UI
    
    // Test Suite
    
    // Test Case 
    
    // Asserts
});
