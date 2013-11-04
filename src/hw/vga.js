(function($){
   /*
    * VGA, SVGA, QVGA
    */
    libDraw.ns('risc.hw.vga');
    
    // Text mode...
    //   
    
   /*
   CGA 16 colors pallete:
   */
   var _CGA_PALLETE = [
      '#000000',
      '#0000AA',
      '#00AA00',
      '#00AAAA',
      '#AA0000',
      '#AA00AA',
      '#AA5500',
      '#AAAAAA',
      '#555555',
      '#5555FF',
      '#55FF55',
      '#55FFFF',
      '#FF5555',
      '#FF55FF',
      '#FFFF55',
      '#FFFFFF'
   ];
   
   var _RESOLUTION_MODES = {
      'CGA_80_25': {
         width: 640,
         height: 200,
         cols: 80,
         rows: 25,
         charWidth: 8,
         charHeight: 8,
         font: '8px monospace',
         fontHeight: 8
      },
      'VGA_80_25': {
         width: 720,
         height: 400,
         cols:80,
         rows: 25,
         charWidth: 9,
         charHeight: 16,
         font: '12px monospace',
         fontHeight: 12
      }
      
   };
   
   
   var VGA = function(config){
      libDraw.ext(this, config);
      this.mode = _RESOLUTION_MODES[config.mode || 'VGA_80_25'];
      if(!this.mode){
         throw new Error('Mode [' + config.mode + '] is not valid VGA mode.');
      }
      if(!this.memory){
         throw new Error('Not attached to memory!');
      }
      
      this.origin = this.origin || 0xB8000;
      if(this.memory.length < this.origin+(this.mode.rows*this.mode.cols*2)){
         throw new Error("Not enough memory. Unable to map physical memory at 0x" + risc.utils.wToHex(this.origin));
      }
      
      this.cache = new Int32Array(this.mode.cols*this.mode.rows/2);
      
      if(!this.runtime){
         var canvas = $('<canvas class="vga-canvas"></canvas>')[0];
         
         this.runtime = new libDraw.pkg.runtime.Runtime({
            spec: {
               width: this.mode.width,
               height: this.mode.height,
               canvas: canvas
            },
            clock:{
               interval: 100, // 10 FPS
               mode: 'interval'
            }
         });
         $(this.appendTo || document.body).append(canvas);
      }
      
      var self = this;
      
      this.runtime.register(function(g, frame, rt){
         self.draw(g, rt);
      });
      
   };
   libDraw.ext(VGA,{
      turnOn: function(){
         this.runtime.clock.start(); // for now
      },
      turnOff: function(){
         this.runtime.clock.stop(); // for now
      },
      draw: function(g,rt){
         var total = this.mode.rows*this.mode.cols/2;
         if(!this.bgset){
            this.bgset = true;
            g.background('#000');            
         }

         g.setFont(this.mode.font);
         var l = 0;
         var row = 0;
         var col = 0;
         var originW = this.origin>>2; // div by 4
         for(var i = 0; i < total; i++){
            if(this.cache[i] != this.memory[originW+i]){
               
               this.cache[i] = this.memory[originW+i];
               l = i*2;
               row = Math.floor(l/this.mode.cols);
               col = l%this.mode.cols;
               this.__printCharacter(row,col, this.cache[i], g);
               col++;
               if(col >= this.mode.cols){
                  col = 0;
                  row++;
               }
               this.__printCharacter(row,col, this.cache[i]>>16, g);
            }
         }
      },
      __printCharacter: function(row, col, char, graphics){
         graphics.fill('#000');
         graphics.rect(col*this.mode.charWidth,
                        row*this.mode.charHeight,
                           this.mode.charWidth, this.mode.charHeight);
         graphics.fill(_CGA_PALLETE[(char>>12)&0xF]);
         graphics.rect(col*this.mode.charWidth,
                        row*this.mode.charHeight,
                           this.mode.charWidth, this.mode.charHeight);
         graphics.fill(_CGA_PALLETE[(char>>8)&0xF]);
         graphics.stroke(_CGA_PALLETE[(char>>8)&0xF]);
         graphics.text(String.fromCharCode(char&0xFF),
            col*this.mode.charWidth,
            row*this.mode.charHeight+this.mode.fontHeight);
      },
      writeText: function(row, col, text, fgColor, bgColor){
         for(var i = 0; i < text.length; i++){
            col++;
            if(col>=this.mode.cols){
               col=0;
               row++;
            }
            if(row>=this.mode.rows)
               break;
            this.__writeChar(row,col,text[i],fgColor,bgColor);
         }
      },
      __writeChar: function(row, col, char, fgColor, bgColor){
         var origin = this.origin>>2;
         var halfWord = row*this.mode.cols+col;
         var word = Math.floor(halfWord/2)  + origin;
         var sh = (halfWord%2)*16;
         var int32 = char.charCodeAt(0) | ((fgColor&0xF)<<12) | ((bgColor&0xF)<<8);
         this.memory[word] = this.memory[word]&(~(0xFFFF<<sh)) | int32<<sh;
         //console.log('PRINTED CHAR IN WORD: ', word, ' -> ', risc.utils.wToHex(this.memory[word]));   
      }
   });
   
   
   risc.hw.vga.VGA = VGA;
    
})(jQuery);
