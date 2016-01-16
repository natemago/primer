(function(){
  def('io.writer',['oop'], function(oop){
    var Writer = function(config){
      config = config || {};
      oop.extend(this, config);
    };

    oop.extend(Writer, {
      writeEntry: function(){
        // does nothing here
      },
      write: function(){
        for(var i = 0; i< arguments.length; i++){
          var arg = arguments[i];
          if(arg instanceof Array){
            this.write.apply(this, arg);
          }else if(arg instanceof String){
            this.writeEntry({text: arg});
          }else if(arg.text !== undefined){
            this.writeEntry(arg);
          }else{
            this.writeEntry({text: arg + ''});
          }
        }
      },
      toProperEntry: function(arg){

      },
      writeLn: function(){
        this.write.apply(this, arguments);
        this.write('\n');
      }
    });

    return {
      Writer: Writer
    };
  });
})();
