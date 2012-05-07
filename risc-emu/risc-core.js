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
      toHexNP: function(v, width){ // No Padding, width in nibbles
         var r = [];
         while( width-- ){
            if((v>>(width*4))&0xF)
               break;
         }
         if(width<0)
            return '0';
         do{
            r.push(__HEX[(v>>(width*4))&0xF]);
         }while(width--);
         return r.join('');
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
      toByteArray: function(strAscii){
         var barr = [];
         for(var i = 0; i < strAscii.length; i++){
            barr[i]=strAscii.charCodeAt(i);
         }
         return barr;
      },
      /**
       * Base64 encoder/decoder
       */
      b64: {
         VARIANTS:{
            'mime':{
               alphabet: [
                  'A','B','C','D','E','F','G','H','I','J',
                  'K','L','M','N','O','P','Q','R','S','T',
                  'U','V','W','X','Y','Z','a','b','c','d',
                  'e','f','g','h','i','j','k','l','m','n',
                  'o','p','q','r','s','t','u','v','w','x',
                  'y','z','0','1','2','3','4','5','6','7',
                  '8','9','+','/'],
               padding:"=",
               maxLine: 76,
               lineSeparator: String.fromCharCode(13,10) // CR+LF
            },
            'url': {
               alphabet: [
                  'A','B','C','D','E','F','G','H','I','J',
                  'K','L','M','N','O','P','Q','R','S','T',
                  'U','V','W','X','Y','Z','a','b','c','d',
                  'e','f','g','h','i','j','k','l','m','n',
                  'o','p','q','r','s','t','u','v','w','x',
                  'y','z','0','1','2','3','4','5','6','7',
                  '8','9','-','_'],
               padding:"=",
               maxLine: 76,
               lineSeparator: String.fromCharCode(13,10) // CR+LF
            },
            'filenames':{
               alphabet: [
                  'A','B','C','D','E','F','G','H','I','J',
                  'K','L','M','N','O','P','Q','R','S','T',
                  'U','V','W','X','Y','Z','a','b','c','d',
                  'e','f','g','h','i','j','k','l','m','n',
                  'o','p','q','r','s','t','u','v','w','x',
                  'y','z','0','1','2','3','4','5','6','7',
                  '8','9','+','-'],
               padding:"=",
               maxLine: 76,
               lineSeparator: String.fromCharCode(13,10) // CR+LF
            }
         },
         encode: function(barr, variant){ // encode byte array
            variant = variant || 'mime';
            var padChar = risc.utils.b64.VARIANTS[variant].padding;
            var alphabet = risc.utils.b64.VARIANTS[variant].alphabet;
            var newLine = risc.utils.b64.VARIANTS[variant].lineSeparator;
            var maxLine = risc.utils.b64.VARIANTS[variant].maxLine;
            var r = '';
            var padding = "";
            var p = 0;
            if(barr.length%3 == 1){
               padding = padChar+padChar;
               p = 2;
            }else if (barr.length%3 == 2) {
               padding = padChar;
               p=1;
            }
            
            var retval = [], line= "",v=0;
            
            for(var  i =0; i < barr.length; i++){
               v|=barr[i];              
               if((i+1)%3==0){
                  for(j=3;j>=0;j--){
                     r=alphabet[(v>>(6*j))&0x3f];
                     line+=r;
                     if(line.length == maxLine){
                        retval.push(line);
                        line="";
                     }               
                  }
                  v=0;
               }
               v<<=8;
            }
            if(p!=0){
               for(var i = 3; i >= p; i--){
                  r=alphabet[(v>>(6*i))&0x3f];
                  line+=r;
                  if(line.length == maxLine){
                     retval.push(line);
                     line="";
                  }
               }
            }
            
            if(line != ""){
               retval.push(line);
            }
            return retval.join(newLine)+padding;
         },
         decode: function(str, variant){
            
         }
         
      }
   };
   
})(jQuery);
