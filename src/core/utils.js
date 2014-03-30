(function(){
   var __HEX = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
   var __B64_ALPHABET = [
   ];
   
   var risc = {};
   
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
         getIndex: function(variant){
            if(!risc.utils.b64.VARIANTS_INDEX){
                risc.utils.b64.VARIANTS_INDEX = {};
            }
            var index = risc.utils.b64.VARIANTS_INDEX[variant];
            if(!index){
                index = risc.utils.b64.VARIANTS_INDEX[variant] = {};
                
                var alphabet = risc.utils.b64.VARIANTS[variant].alphabet;
                for(var i = 0; i < alphabet.length; i++){
                    index[alphabet[i]]=i;
                }
                index[risc.utils.b64.VARIANTS[variant].padding]=0;
            }
            return index;
         },
        /*
        Base 64 encoding scheme

        byte 1                   byte 2                  byte 3
        [ 7 6 5 4 3 2     1 0 ] [ 7 6 5 4     3 2 1 0 ] [ 7 6     5 4 3 2 1 0 ]
        [ 5 4 3 2 1 0 ] [ 5 4     3 2 1 0 ] [ 5 4 3 2     1 0 ] [ 5 4 3 2 1 0 ] 
        c1               c2                  c3                  c4
         */
         encode: function(barr, variant){ // encode byte array
            variant = variant || 'mime';
            var padChar = risc.utils.b64.VARIANTS[variant].padding;
            var alphabet = risc.utils.b64.VARIANTS[variant].alphabet;
            var newLine = risc.utils.b64.VARIANTS[variant].lineSeparator;
            var maxLine = risc.utils.b64.VARIANTS[variant].maxLine;
            var padding = 3 - (barr.length % 3);
           //debugger
            var lines = [];
            var i = 0;
            var line = '';
            do{
                var b = [];
                var j = 3;
                while(j--){
                    b[j]=(i+j) < barr.length ? barr[(i+j)] : 0;
                }
                var c1 = (b[0]>>2)&0x3F;
                var c2 = ((b[0]&0x3)<<4)|((b[1]>>4)&0xF);
                var c3 = ((b[1]&0xF)<<2) | ((b[2]>>4)&0x3);
                var c4 = b[2]&0x3F;
                if( (line.length + 4) >= maxLine){
                    lines.push(line);
                    line = '';
                }
                line+=(alphabet[c1]+alphabet[c2]+alphabet[c3]+alphabet[c4]);      
                i+=3;
            }while(i < barr.length);
            
            if( (barr.length % 3) != 0 ){
                line = line.substring(0, line.length -padding);
                line += (padding == 2 ? padChar+padChar : padChar);
            }
            
            if(line.length){
                lines.push(line);
            }
            
            return lines.join(newLine);
         },
         decode: function(str, variant, lineSeparator){
            variant = variant || 'mime';
            var padChar = risc.utils.b64.VARIANTS[variant].padding;
            var alphabet = risc.utils.b64.VARIANTS[variant].alphabet;
            lineSeparator = lineSeparator || 
                risc.utils.b64.VARIANTS[variant].lineSeparator;
                
                
            str = str.split(lineSeparator).join('');
            var barr = [];
            if( (str.length % 4) != 0 ){
                throw new Error("Invalid Base 64 encoded string.");
            }
            var index = risc.utils.b64.getIndex(variant);
            for(var i = 0; i < str.length; i+=4){
                
                var c1 = index[str[i]];
                var c2 = index[str[i + 1]];
                var c3 = index[str[i + 2]];
                var c4 = index[str[i + 3]];
                
                barr.push( (c1<<2) | (c2>>4) );             // byte 1
                barr.push( ((c2&0xF)<<4) | ((c3>>2)&0xF) ); // byte 2
                barr.push( ( (c3&0x3)<<6 ) | (c4&0x3F) );   // byte 3
                
            }
            var paddCount = 0;
            if(str[str.length-1] == padChar) paddCount++;
            if(str[str.length-2] == padChar) paddCount++;
            if(paddCount > 0 ){
                return barr.slice(0, barr.length - paddCount);
            }
            return barr;
         }
         
      },
      str: {
        trim: function(str){
           str = str.replace(/^\s+/, '');
           for (var i = str.length - 1; i >= 0; i--) {
               if (/\S/.test(str.charAt(i))) {
                   str = str.substring(0, i + 1);
                   break;
               }
           }
           return str;
       }
      }
   };
   
   def('risc.utils', ['utils:each'], function(each){
        each(risc.utils, function(utility, name){
            def('risc.utils.' + name, [], function() { return utility; } );
        });
        return risc.utils;
   });
   
})();
