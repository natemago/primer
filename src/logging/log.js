(function(){
  def('logging.log', ['oop', 'utils:each', 'text.format'], function(oop, each, format){
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

    oop.ext(Logger, {
        _log: function(message, level){
            if(this.logLevel >= level){
                this._write(message, level);
            }
        },
        _write: function(message, level){
            writer.writeLn(format.parseRichText('{logLevel:' + level + '}', message, '{/logLevel}'));
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
