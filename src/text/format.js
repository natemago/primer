(function(){
  def('text.format', ['oop', 'utils:each'], function(oop, each){

    var Lexer = function(text){
      this.text = text;
      this.regex = /\{([^\{\}]+)\}/gm;
      this.lastIndex = 0;
      this.endOfText = false;
      this.command = null;
    };

    oop.extend(Lexer, {
      nextToken: function(){
        if(this.endOfText){
          return null;
        }
        if(this.command){
          var val = this.command;
          this.command = null;
          return {
            command: val
          };
        }
        var res = this.regex.exec(this.text);
        if(res){
          var command = res[1];
          var text = this.text.substring(this.lastIndex, this.regex.lastIndex-res[0].length);
          this.lastIndex = this.regex.lastIndex;
          if(!text){
            return {
              command: command
            }
          }
          this.command = command;
          return {
            text: text
          };
        }else{
          this.endOfText = true;
          if(this.lastIndex == this.text.length){
            return null;
          }
          return {
            text: this.text.substring(this.lastIndex, this.text.length)
          };
        }
      }
    });


    var ContextStack = function(){
      this.contexts = {};
    };

    oop.extend(ContextStack, {
      getContext: function(context){
        var ctxStack = this.contexts[context];
        if(!ctxStack){
          ctxStack = [];
          this.contexts[context] = ctxStack;
        }
        return ctxStack;
      },
      push: function(context, value){
        this.getContext(context).push(value);
      },
      peek: function(context){
        var ctxStack = this.getContext(context);
        return ctxStack.length ? ctxStack[ctxStack.length-1] : null;
      },
      pop: function(context){
        return this.getContext(context).pop();
      },
      values: function(){
        var vals = {};
        each(this.contexts, function(stack, context){
          var value = stack.length ? stack[stack.length -1] : null;
          if(value !== null){
            vals[context] = value;
          }
        });
        return vals;
      }
    });

    var Parser = function(){
      this.stack = new ContextStack();
    };

    oop.extend(Parser, {
      parseText: function(txt){
        var lexer = new Lexer(txt);
        var parsed = [];

        var token = lexer.nextToken();

        while(token){
          var value = null;
          if(token.command){
            value = this.handleCommand(token, lexer, txt);
          }else if(token.text){
            value = this.handleText(token, lexer, txt);
          }else{
            throw new Error('Unknown token type - ' + token);
          }
          if(value){
            parsed.push(value);
          }
          token = lexer.nextToken();
        }

        return parsed;
      },
      parse: function(){
        return this.parseText(Array.prototype.join.call(arguments, ''));
      },
      parseCommand: function(cmd){
        var regex = /\/?([^:]+)\s*:?\s*(.*)/g;
        var res = regex.exec(cmd);
        if(res){
          return {
            command: res[1],
            value: res[2],
            isEnd: /^\s*\/.*/g.test(cmd)
          };
        }else{
          throw new Error('Invalid command: ' + cmd);
        }
      },
      handleCommand: function(token, lexer, txt){
        var command = this.parseCommand(token.command);
        if(command.isEnd){
          if(this.stack.peek(command.command)){
            this.stack.pop(command.command);
          }
        }else{
          this.stack.push(command.command, command.value);
        }
        return null;
      },
      handleText: function(token, lexer, txt){
        return {
          text: token.text,
          format: this.stack.values()
        };
      }
    });

    var parseRichText = function(){
      var parser = new Parser();
      return parser.parse.apply(parser, arguments);
    };


    var formatText = function(text, args){
      var fmtRegex = /\{\}/gmi;
      var fmtText = '';
      var mText = null;
      var i = 0;
      var lastIndex = 0;
      while(true){
        var match = fmtRegex.exec(text);
        if(!match){
          if(lastIndex < text.length){
            fmtText += text.substring(lastIndex, text.length);
          }
          break;
        }

        var replacement = args[i];
        if(replacement === undefined){
          replacement = '';
        }

        mText = text.substring(lastIndex, fmtRegex.lastIndex - 2);
        mText += replacement;
        fmtText += mText;
        lastIndex = fmtRegex.lastIndex;
        i++;
      }
      return fmtText;
    };

    var format = function(){
      var text = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      return formatText(text, args);
    };

    return {
      Lexer: Lexer,
      Parser: Parser,
      format: format
    };
  });

})();
