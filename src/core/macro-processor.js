def('risc.core.MacroProcessor', 
    ['libDraw', 'di:console'], 
    function(libDraw, console){
    
    
    
    var MacroProcessor = function(config){
        libDraw.ext(this, config);
    };
    
    
    
    
    
    libDraw.ext(MacroProcessor, {
        process: function(fn, macroName, context, arguments){
            var md = this.buildMacroDef(fn, macroName);
            libDraw.each(context, function(macro, macroName){
                md.body = macro.expand(md.body);
            });
            
            var macro =  new Macro(md);
            return macro;
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
    
    var RE_MACRO_ARG = '\\s*([\\w\\d\\.\\$\\[\\]\'"_]+)';
    var Macro = function(config){
        libDraw.ext(this, config);
        this.RE_MACRO_ARG = this.RE_MACRO_ARG || RE_MACRO_ARG;
        this.compile();
    };
    
    libDraw.ext(Macro, {
        compile: function(){
            if(this.compiled){
                return;
            }
            this.compiled = true;
            this._buildRE();
        },
        _buildRE: function(){
            var self = this;
            var reStr = [this.name, '\\s*\\('];
            reStr.push(this.arguments.map(function(arg){
                return self.RE_MACRO_ARG;
            }).join('\\s*,'));
            reStr.push('\\s*\\)\\s*;?');
            this.regExpString = reStr.join('');
            this.argsRegExps = {};
            libDraw.each(this.arguments, function(argName){
                this.argsRegExps[argName] = '\\b'+argName+'\\b';
            }, this);
        },
        getRegExp: function(modifiers){
            return new RegExp(this.regExpString, modifiers || 'mg');
        },
        expand: function(str){
            var expanded = str;
            var mre = this.getRegExp();
            var match, matched = {};
            
            while( (match = mre.exec(str) )!==null ){
                expanded = expanded.replace(match[0], this.expandArgs(match[0]));
            }
            
            return expanded;
        },
        expandArgs: function(match){
            // get the actual arguments first:
            var str = match.substring(match.indexOf('(') + 1, 
                match.lastIndexOf(')') );
            // map arg name -> replacement
            var argRe = new RegExp(this.RE_MACRO_ARG, 'gm');
            var ma, argMapping = {};
            var  i = 0;
            while( (ma = argRe.exec(str)) !== null ){
                if( this.arguments[i] === undefined ){
                    throw new Error('Too many arguments in macro: ' + 
                        this.name + '. Expression: ' + match);
                }
                argMapping[this.arguments[i]] = ma[1];
                i++;
            }
            if(this.arguments.length > i){
                throw new Error('Too few arguments in macro: ' + 
                        this.name + '. Expression: ' + match);
            }
            // replace each argument with the replacement in the macro body
            var expandedMacro = this.body;
            libDraw.each(this.arguments, function(argName){
                expandedMacro = expandedMacro.replace(
                    new RegExp(this.argsRegExps[argName], 'gm'), argMapping[argName]);
            }, this);
            
            return expandedMacro;
        }
    });
    
    return MacroProcessor;
});
