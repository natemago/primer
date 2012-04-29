/**
 * RISC Processor emulator core lib
 */
(function($){
   /**
    * risc namespace
    * utils namespace
    */
   libDraw.ns('risc.utils');
   libDraw.ns('risc.core');
   
   risc.core.CPU = function(
         memory, 
         registers, 
         instructions,
         clock,
         inspc
            ){
      this.M = memory;
      this.R = registers;
      this.I = instructions;
      this.clock = clock;
      this.instructionsCount = inspc;
      
      this.PC = 0;
      
      this.clock.addHandler(this.cycle,this);
   };
   libDraw.ext(risc.core.CPU,{
      cycle: function(tick){
         var instr = 0;
         var ic = this.instructionsCount;
         var PC = this.PC;
         var M = this.M;
         try{
            for(var i = 0; i < ic; i++){
               instr = M[PC]; // fetch
               this.execInstr(instr);
               // totally worthless cpu cycle :|
            }
         }catch(e){
            console.log(e);
            this.turnOff();
         }
      },
      execInstr: function(instr){
         
      },
      turnOn: function(){
         this.clock.start();
      },
      turnOff: function(){
         this.clock.stop();
      },
      pause: function(){
         this.clock.pause();
      },
      interrupt: function(){
         // TODO: implement this...
      },
      getClockFrequency: function(){
         return this.clock.getMeasure().frequency || 0;
      },
      getUsage: function(){
         return this.clock.getMeasure().usage.usage || 0;
      },
      getSpeed: function(){
         return this.instructionsCount * this.getClockFrequency();
      },
      isRunning: function(){
         return !this.clock.started;
      },
      // debugging fucntions
      getRegisters: function(){},
      getStatusRegisterValue: function(){},
      getProgramCounterValue: function(){
         return this.PC;
      },
      
   });
   
   var __HEX = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
   var __B64_ALPHABET = [
   ];
   risc.utils = {
      
      bToHex: function(b){
         return __HEX[(b>>4)&0xF] + 
            __HEX[b&0xF];
      },
      hwToHex: function(halfWord){
         return risc.utils.bToHex(halfWord>>8)+' '
            +risc.utils.bToHex(halfWord);
      },
      wToHex: function(word){
         return risc.utils.hwToHex(word>>16) + ' ' +
               risc.utils. hwToHex(word);
      },
      toHex: function(v, width){
         var r = '';
         while(width--){
            r+=__HEX[(v>>(width*4))&0xf];
         }
         return r;
      },
      toBinary: function(v,width){
         var r = '';
         while(width--){
            if( (0x1<<width) & v){
               r+='1';
            }else{
               r+='0';
            }
         }
         return r;
      },
      byteToBinary: function(b){
         return risc.utils.toBinary(b,8);
      },
      hwToBinary: function(halfWord){
         return risc.utils.toBinary(halfWord,16);
      },
      wToBinary: function(word){
         return risc.utils.toBinary(word,32);
      },
      memToHex: function(mem, align, start, end){
         align = align || 4;
         start = start || 0;
         end = end || mem.length;
         var ret = [];
         var toHex = risc.utils.wToHex;
         if(align == 2)
            toHex = risc.utils.hwToHex;
         else if (align == 1)
            toHex = risc.utils.bToHex;
            
         for(var i = start; i < end; i++){
            ret.push(i+'. ' + toHex(mem[i]));
         }
         
         return ret;
      },
      /**
       * Base64 encoder/decoder
       */
      b64: {
         PADDING: "=",
         ALPHABET: [
            'A','B','C','D','E','F','G','H','I','J',
            'K','L','M','N','O','P','Q','R','S','T',
            'U','V','W','X','Y','Z','a','b','c','d',
            'e','f','g','h','i','j','k','l','m','n',
            'o','p','q','r','s','t','u','v','w','x',
            'y','z','0','1','2','3','4','5','6','7',
            '8','9','+','/'],
         NEWLINE: String.fromCharCode(13,10), // CR, LF
         encode: function(barr){ // encode byte array
            //debugger
            var r = '';
            var padding = "";
            var p = 0;
            if(barr.length%3 == 1){
               padding = risc.utils.b64.PADDING+risc.utils.b64.PADDING;
               p = 2;
            }else if (barr.length%3 == 2) {
               padding = risc.utils.b64.PADDING;
               p=1;
            }
            var l = barr.length;
            while(p--)barr.push(0);
            
            var retval = [], line= "";
            
            for(var i = 0; i < barr.length; i+=3){
               var v = 0;
               for(var j = 0; j < 3; j++){
                  var v1 = barr[i*3+j]&0xFF;
                  v<<=8;
                  v|=barr[i*3+j]&0xFF;
               }
               console.log(risc.utils.wToBinary(v));
               for(var j = 3; j >=0; j--){
                  var v3 = (v>>(j*6))&0x3F;
                  line+=risc.utils.b64.ALPHABET[v3];
                  console.log(risc.utils.toBinary(v3, 6));
                  if(line.length == 64){
                     retval.push(line);
                     line = "";
                  }
               }
            }
            if(line != ""){
               retval.push(line);
            }
            return retval.join(risc.utils.b64.NEWLINE);
         }
         
      }
   };
   
})(jQuery);
