(function($){
   /*
    * VGA, SVGA, QVGA
    */
    
    
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
         font: '8px monospace'
      },
      'VGA_80_25': {
         width: 720,
         height: 400,
         cols:80,
         rows: 25,
         charWidth: 9,
         charHeight: 16,
         font: '10px monospace'
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
         
      },
      turnOff: function(){
         
      },
      draw: function(g,rt){
         var total = this.mode.rows*this.mode.cols/2;
         g.background('#000');
         var c = 0;
         var bc = 0;
         var fc = 0;
         var rc = 0;
         var cc = 0;
         for(var i = 0; i < total; i++){
            if(this.cache[i] != this.memory[this.origin+i]){
               this.cache[i] = this.memory[this.origin+1];
               c = this.cache[i]&0xFF;
               bc = (this.cache[i]>>12)&&0xF;
               fc = (this.cache[i]>>8)&&0xF;
               g.fill(_CGA_PALLETE[bc]);
               cc = (i%this.mode.cols)*2*this.mode.charWidth;
               rc = Math.floor(i/this.mode.rows)*this.mode.charHeight;
               g.rect(cc, rc,
                   this.mode.charWidth, this.mode.charHeight);
               g.fill(_CGA_PALLETE[fc]);
               g.text(String.fromCharCode(this.cache[i]),cc,rc+this.mode.charHeight);
               
               c = (this.cache[i]>>16)&0xFF;
               bc = (this.cache[i]>>28)&&0xF;
               fc = (this.cache[i]>>24)&&0xF;
               
               g.fill(_CGA_PALLETE[bc]);
               g.rect(cc+1, rc,
                   this.mode.charWidth, this.mode.charHeight);
               g.fill(_CGA_PALLETE[fc]);
               g.text(String.fromCharCode(this.cache[i]),cc,rc+this.mode.charHeight);
            }
         }
      },
      
   });
    
})(jQuery);
