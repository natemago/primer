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
      
      this.addOperation('add', 'calc-operation-add', function(inp1, inp2){
         var v1 = this.parseToNumber($(inp1).val());
         var v2 = this.parseToNumber($(inp2).val());
         return v1+v2;
      },'+');
      this.addOperation('sub', 'calc-operation-sub', function(inp1, inp2){
         var v1 = this.parseToNumber($(inp1).val());
         var v2 = this.parseToNumber($(inp2).val());
         return v1-v2;
      },'-');
      this.addOperation('xor', 'calc-operation-sub', function(inp1, inp2){
         var v1 = this.parseToNumber($(inp1).val());
         var v2 = this.parseToNumber($(inp2).val());
         return v1^v2;
      },'^');
      this.addOperation('shift-right', 'calc-operation-sub', function(inp1, inp2){
         var v1 = this.parseToNumber($(inp1).val());
         var v2 = this.parseToNumber($(inp2).val());
         return v1>>v2;
      },'>>');
      this.addOperation('shift-left', 'calc-operation-sub', function(inp1, inp2){
         var v1 = this.parseToNumber($(inp1).val());
         var v2 = this.parseToNumber($(inp2).val());
         return v1<<v2;
      },'<<');
      
      
      
      this.addPanel('Dec', function(inp, input1, input2, result, value){
         if(value != NaN){
            result.innerHTML = value;
         }
      });
      this.addPanel('HEX', function(inp, input1, input2, result, value){
         if(value != NaN){
            result.innerHTML = risc.utils.wToHex(value);
         }
      });
      
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
            self.__trigerChange();
         });
         
         $(el).hover(function(){
            $(this).addClass('calc-operation-hover');
         },function(){
            $(this).removeClass('calc-operation-hover');
         });
         
         $(this.operationsEl).append(el);
         this.operations.push(el);
      },
      addPanel: function(name, onChange){
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
         $('.calc-panel-input', el).each(function(i,e){
            (function(panel){
               var inp = $('.calc-text-input', panel);
               $('.calc-input-decr', panel).click(function(ev){
                  var val = inp.val();
                  if(val !== undefined){
                     val = self.parseToNumber(val);
                     if(val != NaN){
                        val--;
                        inp.val(val);
                        self.__trigerChange();
                     }
                  }
                  ev.stopPropagation();
               });
               $('.calc-input-incr', panel).click(function(ev){
                  var val = inp.val();
                  if(val !== undefined){
                     val = self.parseToNumber(val);
                     if(val != NaN){
                        val++;
                        inp.val(val);
                        self.__trigerChange();
                     }
                  }
                  ev.stopPropagation();
               });
            })(this);
         });
         
         var result = $('.calc-result', el)[0];
         
         var changeHandler = function(inp){
            return function(){
               var input1 = $('.calc-text-input',el)[0];
               var input2 = $('.calc-text-input',el)[1];
               self.__setValues(input1,input2);
               if(self.currentOperation){
                  var value = self.currentOperation(input1, input2);
                  onChange.call(self, inp, input1, input2, result, value);
               }
            };
         };
         $('.input-1 .calc-text-input',el).change(changeHandler('input-1'));
         $('.input-2 .calc-text-input',el).change(changeHandler('input-2'));
         
         this.panels[name] = el;
         $(this.panelsEl).append(el);
         
         $('.calc-text-input', el).keyup(function(){
            self.__trigerChange();
         });
      },
      __trigerChange: function(){
         $('.calc-text-input', this.el).trigger('change');
      },
      __setValues: function(inp1, inp2){
         for(var k in this.panels){
            if(this.panels.hasOwnProperty(k)){
               $('.input-1 .calc-text-input',this.panels[k]).val($(inp1).val());
               $('.input-2 .calc-text-input',this.panels[k]).val($(inp2).val());
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
