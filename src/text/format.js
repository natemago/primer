(function(){
  def('text.format', ['oop'], function(oop){

    var Lexer = function(text){
      this.text = text;
      this.regex = /\{([^\{\}]+)\}/gm;
      this.lastIndex = 0;
      this.endOfText = false;
    };

    oop.extend(Lexer, {
      nextToken: function(){
        if(this.endOfText){
          return null;
        }
        var res = this.regex.exec(this.text);
        if(res){
          var command = res[1];
          var text = this.text.substring(this.lastIndex, this.regex.lastIndex-res[0].length);
          this.lastIndex = this.regex.lastIndex;
          return {
            text: text,
            command: command
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
