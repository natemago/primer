(function(){
  def('text.format', ['oop'], function(oop){

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

    return {
      Lexer: Lexer
    };
  });

})();
