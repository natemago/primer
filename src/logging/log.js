(function(){
  def('logging.log', ['oop', 'utils:each'], function(oop, each){
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
  });
})();
