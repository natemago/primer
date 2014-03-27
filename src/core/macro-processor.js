def('risc.core.MacroProcessor', 
    ['libDraw', 'di:console'], 
    function(libDraw, console){
    
    
    
    var MacroProcessor = function(config){
        libDraw.ext(this, config);
    };
    
    
    
    
    
    libDraw.ext(MacroProcessor, {
        process: function(fn, macroName, context, arguments){
            var md = this.buildMacroDef(fn, macroName);
            
        },
        buildMacroDef: function(fn, name){
            var RE_MACRO_ARGS = /^function\s+\(([^\)]+)\)\s?{/m;
            var RE_ARGUMENT = /[\w\d\$_]+/gm;
            var macroDef = {
                name: name,
                arguments: [],
                body: ''
            };
            var fnStr = fn.toString();
            var mArgs = RE_MACRO_ARGS.exec(fnStr)[1];
            if(mArgs){
                var argMatch
                while( (argMatch = RE_ARGUMENT.exec(mArgs)) !== null){
                    macroDef.arguments.push(argMatch[0]);
                }
            }
            
            macroDef.body = fnStr.substring(fnStr.indexOf('{')+1, 
                fnStr.lastIndexOf('}'));
            
            return macroDef;
        }
    });
    
    
    var Macro = function(config){
        libDraw.ext(this, config);
    };
    
    libDraw.ext(Macro, {
        
    });
    
    return MacroProcessor;
});
