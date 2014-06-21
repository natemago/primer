(function($){
   libDraw.ns('risc.mon');
   
      risc.mon.PropertyMonitor = function(cfg){
       var holder = cfg.holder || document.body;
       var watch = cfg.watch || [];
       var interval = cfg.interval || 1000;
       var self = this;
       this.watched = {};
       
       this.el = $([
         '<div class="monitor-wrapper">',
            '<div class="monitor-name">',cfg.name || '','</div>',
         '</div>'].join(''))[0];
       $(holder).append(this.el);
       for(var i = 0; i < watch.length; i++){
         watch[i].monitor = function(){
            
            var target = this.target || window;
            var params = this.params || [];
            var label = this.label || this.id;
            var value = undefined;
            try{
               if( typeof(this.property) == 'string' ){
                  var v = target[this.property];
                  if( typeof(v) == 'function'){
                     value = v.apply(target, params);
                  }else{
                     value = v;
                  }
               }else if( typeof(this.property) == 'function'){
                  value = this.property.apply(target, params);
               }
               self.update(this.id,label, value);
            }catch(e){
               self.error(this.id,label, e.message);
            }
         }
         watch[i].id = libDraw.getId('mon');
         var ww = $([
            '<div class="monitor-entry">',
               '<span class="monitor-label"></span>',
               '<span class="monitor-value"></span>',
            '</div>'
         ].join(''));
         watch[i].labelEl = $('.monitor-label',ww)[0];
         watch[i].valueEl = $('.monitor-value',ww)[0];
         this.watched[watch[i].id] = watch[i];
         $(this.el).append(ww);
       }
       
       this.clock = risc.mon.PropertyMonitor.__CLOCK_POOL[interval];
       if(!this.clock){
         this.clock = new libDraw.pkg.timer.Clock({
            interval: interval,
            mode: 'interval'
         });
         risc.mon.PropertyMonitor.__CLOCK_POOL[interval] = this.clock;
       }
       this.clock.addHandler(function(){
          for(var  i = 0; i < watch.length; i++){
             watch[i].monitor.call(watch[i]);
          }
       }, this);
       
   };   
   
   risc.mon.PropertyMonitor.__CLOCK_POOL={};
   
   libDraw.ext(risc.mon.PropertyMonitor, {
      update: function(id, label, value){
         var w = this.watched[id];
         if(w){
            w.labelEl.innerHTML = label;
            w.valueEl.innerHTML = value;
         }
      },
      error: function(id, label, value){
         var w = this.watched[id];
         if(w){
            w.labelEl.innerHTML = label;
            w.valueEl.ihherHTML = '<span class="monitor-error">'+value+"</span>";
         }
      },
      watch: function(){
         if(!this.clock.started){
            this.clock.start();
         }
      }
   });
   
   
   risc.mon.MemoryMonitor = function(config){
      libDraw.ext(this, config);
      var m = [
         '<div class="memory-monitor">',
            '<div class="memory-address-bar"></div>',
            '<div class="memory-bar"></div>',
            '<div class="memory-disassm-bar"></div>',
         '</div>'
      ].join('');
      this.el = $(m)[0];
      this.addressBarEl = $('.memory-address-bar',this.el)[0];
      this.memoryBarEl = $('.memory-bar',this.el)[0];
      this.disassmBarEl = $('.memory-disassm-bar',this.el)[0];
      $(config.appendTo || document.body).append(this.el);
      
      this.memory = this.memory || [];
      
      this.assembler = this.assembler || {
         instructionToString: function(){return "N/A";}
      };
      
      this.chunkSize = this.chunkSize || 32;
      this.remap(0);
   };
   
   libDraw.ext(risc.mon.MemoryMonitor,{
      show: function(){
         $(this.el).show();
      },
      hide: function(){
         $(this.el).hide();
      },
      highlight: function(address){
         if(address >= this.address.start &&
            address < this.address.end){
            if(this.highlighted){
               $(this.highlighted.address).removeClass('memory-highlight');
               $(this.highlighted.memory).removeClass('memory-highlight');
               $(this.highlighted.disassm).removeClass('memory-highlight');
            }else{
               this.highlighted = {};
            }
            var index = address - this.address.start;
            var ael = $('.memory-address-label', this.addressBarEl)[index];
            var vel = $('.memory-value-label', this.memoryBarEl)[index];
            var del = $('.memory-disassm-label', this.disassmBarEl)[index];
            this.highlighted.address = ael;
            this.highlighted.memory = vel;
            this.highlighted.disassm = del;
            $(ael).addClass('memory-highlight');
            $(vel).addClass('memory-highlight');
            $(del).addClass('memory-highlight');
         }
      },
      remap: function(start, end){
         start = start || 0;
         end = end || this.memory.length;
         if(end > this.memory.length)
            end = this.memory.length;
         this.address = this.address || {};
         this.address.start = start;
         this.address.end = end;
         
         var addresses = [];
         var values    = [];
         var disassm   = [];         
         
         for(var i = start; i < end; i++){
            addresses.push('<div class="memory-address-label">'+
            risc.utils.toHex(i,8)+'</div>');
            values.push('<div class="memory-value-label">'+
               risc.utils.wToHex(this.memory[i]) + '</div>');
            disassm.push('<div class="memory-disassm-label">' +
              this.assembler.instructionToString(this.memory[i]) + '</div>');
         }
         
         
         
         this.addressBarEl.innerHTML = addresses.join('');
         this.memoryBarEl.innerHTML = values.join('');
         this.disassmBarEl.innerHTML = disassm.join('');
      },
      remapFrom: function(start){
         if(start < 0)start=0;
         if(start > this.memory.length)start=this.memory.length;
         var end = start + this.chunkSize;
         if(end > this.memory.length) end = this.memory.length;
         this.remap(start,end);
      }
   });
   
   risc.mon.CPUMonitor = function(config){
      libDraw.ext(this, config);
      if(!this.cpu){
         throw new Error("Unspecified CPU to monitor!");
      }
      
      var m = [
         '<div class="cpu-monitor">',
            '<div class="cpu-registers-monitor"></div>',
         '</div>'
      ].join('');
      
      this.el = $(m)[0];
      $(config.appendTo || document.body).append(this.el);
      this.registersEl = $('.cpu-registers-monitor',this.el)[0];
   };
   libDraw.ext(risc.mon.CPUMonitor, {
      update: function(){
         this.updateRegisters();
         
      },
      updateRegisters: function(){
         var registers = this.cpu.getRegisters();
         var rm = [];
         for(var i = 0; i < registers.length; i++){
            rm.push([
               '<div class="register-entry">',
                  '<span class="register-label">', registers[i].label || i,': </span>',
                  '<span class="register-value">', 
                     risc.utils.wToHex(registers[i].value || 0),
                  '</span>',
               '</div>'
            ].join(''));
         }
         rm.push([
            '<div class="register-entry">',
               '<span class="register-label">Program Counter: </span>',
               '<span class="register-value">', 
                  risc.utils.wToHex(this.cpu.getProgramCounterValue() || 0),
               '</span>',
            '</div>'
         ].join(''));
         
         var psr = this.cpu.getStatusRegisterValue();
         var psrVal = [];
         for(var i=0; i < psr.length; i++){
            psrVal.push('<span class="');
            if(psr[i].on){
               psrVal.push("psr-flag-on");
            }else{
               psrVal.push("psr-flag-off");
            }
            psrVal.push('">');
            psrVal.push(psr[i].label);
            psrVal.push('</span>');
         }
         rm.push([
            '<div class="register-entry status-register">',
               '<span class="register-label status-register">PSR: </span>',
               '<span class="register-value status-register">', 
                  psrVal.join(''),
               '</span>',
            '</div>'
         ].join(''));
         
         this.registersEl.innerHTML = rm.join('');
      }
   });
   
   
   risc.mon.StepTools = function(config){
      if(!config.cpu){
         throw new Error("Unknown CPU.");
      }
      libDraw.ext(this, config);
   };
   libDraw.ext(risc.mon.StepTools, {
      
   });
   
   
   risc.mon.Calc = function(){
      var m = [
         '<div class="mon-tools-calc">',
            '<div class="calc-actions round-bottom-right"></div>',
            '<div class="calc-panels round-bottom-right"></div>',
         '</div>'
      ];
      this.el = $(m.join(''))[0];
      this.operationsEl = $('.calc-actions', this.el)[0];
      this.panelsEl     = $('.calc-panels',  this.el)[0];
      
      $(document.body).append(this.el);
      this.operations = [];
      this.panels = {};
      
      this.parseToNumber = parseInt;
      
      this.values = {
         value1: 0,
         value2: 0,
         result: 0
      };
      
      var self = this;
      
      this.addOperation('Add','',function(){
         self.values.result = self.values.value1+self.values.value2;
      },'+');
      
      this.addOperation('Sub','',function(){
         self.values.result = self.values.value1-self.values.value2;
      },'-');
      
      
      this.addPanel('DEC',function(v){
         v = parseInt(v,10);
         if(v!=0 && !v)
            v=0;
         console.log('dec:parse:',v);
         return v;
      },function(v){
         if(v!=0 && !v)
            v=0;
         console.log('dec:write:',v);
         return v;
      });
      
      this.addPanel('HEX',function(v){
         v = parseInt(v,16);
         if(v!=0 && !v)
            v=0;
         console.log('dec-2:parse:',v);
         return v;
      },function(v){
         if(v!=0 && !v)
            v=0;
         //debugger
         v = risc.utils.toHexNP(v,8);
         console.log('dec-2:write:',v);
         return v;
      });
      
      this.__updateValues();
   };
   
   libDraw.ext(risc.mon.Calc, {
      addOperation: function(name, clazz, callback, markup){
         var el = $([
            '<div class="', clazz, ' round-all calc-operation" title="',name,'">',
               (markup || ''),
            '</div>' 
         ].join(''))[0];
         var self = this;
         $(el).click(function(){
            self.currentOperation = callback;
            for(var  i = 0; i < self.operations.length; i++){
               $(self.operations[i])
                  .removeClass('calc-operation-selected');
            }
            $(this).addClass('calc-operation-selected');
            self.__trigerChange($('.calc-text-input',self.el)[0]);
         });
         
         $(el).hover(function(){
            $(this).addClass('calc-operation-hover');
         },function(){
            $(this).removeClass('calc-operation-hover');
         });
         
         $(this.operationsEl).append(el);
         this.operations.push(el);
      },
      addPanel: function(name, parseValue, writeValue){
         var self = this;
         var m = [
            '<div class="calc-panel round-bottom-right">',
               '<div class="calc-panel-title">',name,'</div>',
               '<div class="calc-panel-inputs">',
                  '<div class="calc-panel-input input-1">',
                     '<span class="calc-input-decr round-all">-</span>',
                     '<input type="text" class="calc-text-input"/>',
                     '<span class="calc-input-incr round-all">+</span>',
                  '</div>',
                  '<div class="calc-panel-input input-2">',
                     '<span class="calc-input-decr round-all">-</span>',
                     '<input type="text" class="calc-text-input"/>',
                     '<span class="calc-input-incr round-all">+</span>',
                  '</div>',
                  '<div class="calc-panel-result">',
                     '<span class="calc-input-decr round-all">|</span>',
                     '<span type="text" class="calc-result"/>',
                     '<span class="calc-input-incr round-all">|</span>',
                  '</div>',
               '</div>',
            '</div>'
         ].join('');
         var el = $(m)[0];
         
         var decrHandler = function(inp){
            if(inp == 'input-1'){
               return function(){
                  self.values.value1--;
                  self.__updateValues();
                  self.__trigerChange($('.input-1 .calc-text-input',el)[0]);
               }
            }else{
               return function(){
                  self.values.value2--;
                  self.__updateValues();
                  self.__trigerChange($('.input-2 .calc-text-input',el)[0]);
               }
            }
         };
         
         var incrHandler = function(inp){
            if(inp == 'input-1'){
               return function(){
                  self.values.value1++;
                  self.__updateValues();
                  self.__trigerChange($('.input-1 .calc-text-input',el)[0]);
               }
            }else{
               return function(){
                  self.values.value2++;
                  self.__updateValues();
                  self.__trigerChange($('.input-2 .calc-text-input',el)[0]);
               }
            }
         };
         
         $('.input-1 .calc-input-decr', el).click(decrHandler('input-1'));
         $('.input-2 .calc-input-decr', el).click(decrHandler('input-2'));
         $('.input-1 .calc-input-incr', el).click(incrHandler('input-1'));
         $('.input-2 .calc-input-incr', el).click(incrHandler('input-2'));
         
         var result = $('.calc-result', el)[0];
         
         var changeHandler = function(inp){
            return function(){
               var val = $(this).val();
               console.log('change:',inp);
               if(inp == 'input-1'){
                  self.values.value1 = parseValue(val);
               }else{
                  self.values.value2 = parseValue(val);
               }
               if(self.currentOperation){
                  self.currentOperation();
               }
               self.__updateValues();
            }
         };
         $('.input-1 .calc-text-input',el).change(changeHandler('input-1'));
         $('.input-2 .calc-text-input',el).change(changeHandler('input-2'));
         
         this.panels[name] = {el:el,writeValue: writeValue};
         $(this.panelsEl).append(el);
         
         $('.calc-text-input', el).keyup(function(){
            console.log('keyup');
            self.__trigerChange(this);
         });
      },
      __trigerChange: function(e){
         $(e).trigger('change');
      },
      __updateValues: function(){
         for(var k in this.panels){
            if(this.panels.hasOwnProperty(k)){
               $('.input-1 .calc-text-input',this.panels[k].el)[0].value=this.panels[k].writeValue(this.values.value1);
               $('.input-2 .calc-text-input',this.panels[k].el)[0].value=this.panels[k].writeValue(this.values.value2);
               $('.calc-result', this.panels[k].el).html(this.panels[k].writeValue(this.values.result));
            }
         }
      },
      showPanel: function(name){
         if(this.panels[name])
            $(this.panels[name]).show();
      },
      hidePanel: function(name){
         if(this.panels[name])
            $(this.panels[name]).hide();
      },
      show: function(){
         $(this.el).show();
      },
      hide: function(){
         $(this.el).hide();
      }
   });
   
   
})(jQuery);
