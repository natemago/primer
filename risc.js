(function($){
   
   
   
   
   var CPU = function(
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
   libDraw.ext(CPU,{
      cycle: function(tick){
         var instr = 0;
         var ic = this.instructionsCount;
         var PC = this.PC;
         var M = this.M;
         for(var i = 0; i < ic; i++){
            instr = M[PC]; // fetch
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
      }
   });
   
   
   
   
   
   
   // //////////////////////////////////////////////////////////////////////////
   // /////////////////////// ARMv7-A / ARMv7-R ////////////////////////////////
   // //////////////////////////////////////////////////////////////////////////
   
   /*
      ARMv7 System Level: ARM Core Registers View:
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   |  APP   |  | User   | System | Hyp    |   svc  | Abort  |   und  |Monitor | IRQ    | FIQ    |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R0     |  |R0_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R1     |  |R1_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R2     |  |R2_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R3     |  |R3_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R4     |  |R4_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R5     |  |R5_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R6     |  |R6_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R7     |  |R7_usr  |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R8     |  |R8_usr  |        |        |        |        |        |        |        | R8_fiq |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R9     |  |R9_usr  |        |        |        |        |        |        |        | R9_fiq |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R10    |  |R10_usr |        |        |        |        |        |        |        |R10_fiq |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R11    |  |R11_usr |        |        |        |        |        |        |        |R11_fiq |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | R12    |  |R12_usr |        |        |        |        |        |        |        |R12_fiq |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | SP     |  |SP_usr  |        | SP_hyp | SP_svc | SP_abt | SP_und | SP_mon | SP_irq |SP_fiq  |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | LR     |  |LR_usr  |        |        | LR_svc | LR_abt | LR_und | LR_mon | LR_irq |LR_fiq  |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | PC     |  |PC      |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | APSR   |  |CPSR    |        |        |        |        |        |        |        |        |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | <none> |  | <none> | <none> |SPSR_hyp|SPSR_svc|SPSR_abt|SPSR_und|SPSR_mon|SPSR_irq|SPSR_fiq|
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   | <none> |  | <none> | <none> |ELR_hyp | <none> | <none> | <none> | <none> | <none> | <none> |
   +--------+  +--------+--------+--------+--------+--------+--------+--------+--------+--------+
   
   Naming:
      R0-R12  - genral purpose registers - in all modes, some are specific to
                mode, but all of them regardless of mode are general purpose 
                registers.
      SP      - Stack Pointer
      LR      - Link Register
      PC      - Program Counter
      CPSR    - Current Program Status Register
      SPSR    - Saved Program Status Register
   
   
   */
   
   
   var ARMv7_CPU = function(config){
      var R = new Int32Array(45);
      R.set([
      
      //     Value,                   Name,     Index,                    Description         
                 0,         //  RName_0usr  0
                 0,         //  RName_1usr  1
                 0,         //  RName_2usr  2
                 0,         //  RName_3usr  3
                 0,         //  RName_4usr  4
                 0,         //  RName_5usr  5
                 0,         //  RName_6usr  6
                 0,         //  RName_7usr  7
                 0,         //  RName_8usr  8
                 0,         //  RName_8fiq  9
                 0,         //  RName_9usr  10
                 0,         //  RName_9fiq  11
                 0,         // RName_10usr  12
                 0,         // RName_10fiq  13
                 0,         // RName_11usr  14
                 0,         // RName_11fiq  15
                 0,         // RName_12usr  16
                 0,         // RName_12fiq  17
                 0,         // RName_SPusr  18
                 0,         // RName_SPfiq  19
                 0,         // RName_SPirq  20
                 0,         // RName_SPsvc  21
                 0,         // RName_SPabt  22
                 0,         // RName_SPund  23
                 0,         // RName_SPmon  24
                 0,         // RName_SPhyp  25
                 0,         // RName_LRusr  26
                 0,         // RName_LRfiq  27
                 0,         // RName_LRirq  28
                 0,         // RName_LRsvc  29
                 0,         // RName_LRabt  30
                 0,         // RName_LRund  31
                 0,         // RName_LRmon  32
                 0,         //    RName_PC  33     Program Counter
         
                 0,         //   CPSR/APSR  34 - Current Program Status Register 
         
         // Saved Program Status Registers - store the CPSR value upon exception
                 0,         //    SPSR_hyp  35
                 0,         //    SPSR_svc  36
                 0,         //    SPSR_abt  37
                 0,         //    SPSR_und  38
                 0,         //    SPSR_mon  39
                 0,         //    SPSR_irq  40
                 0,         //    SPSR_fiq  41
         
         // These are not part of the specification, and are intended for padding...
                 0,         //     EMPTY-0         42
                 0,         //     EMPTY-1         43
                 0          //     RName_ELRhyp    44
      ]);
      
      var M = { // ARMv7 processor modes:
      
      // USER MODE
      // value      encoding        mode   
         0x10: //   10000        User usr  
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               18, // RName_SPusr
               26, // RName_LRusr
               33, // RName_PC 
               34, // CPSR
               42, // array padding
               43  // array padding
               ]),
     
     
     // FIQ MODE
     // value      encoding        mode   
         0x11: //   10001        FIQ fiq
            new Int32Array([ 
               0, 1, 2, 3, 4, 5, 6, 7, // RName_0usr - RName_7usr
               9,11,13,15,17,          // RName_8fiq - RName_12fiq
               19, // RName_SPfiq
               27, // RName_LRfiq
               33, // RName_PC 
               34, // CPSR
               41, // SPSR_fiq
               43  // array padding
               ]),
               
               
     // IRQ MODE
     // value      encoding        mode   
         0x12: //   10010        IRQ irq
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               20, // RName_SPirq
               28, // RName_LRirq
               33, // RName_PC 
               34, // CPSR
               40, // SPSR_irq
               43  // array padding
               ]),
               
               
     // SUPERVISOR MODE
     // value      encoding        mode   
         0x13: //   10011        Supervisor svc
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               21, // RName_SPsvc
               29, // RName_LRsvc
               33, // RName_PC 
               34, // CPSR
               36, // SPSR_svc
               43  // array padding
               ]),
               
               
     // MONITOR MODE
     // value      encoding        mode   
         0x16: //   10110          Monitor mon
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               24, // RName_SPmon
               32, // RName_LRmon
               33, // RName_PC 
               34, // CPSR
               39, // SPSR_mon
               43  // array padding
               ]),
     
     // ABORT MODE
     // value      encoding        mode   
         0x17: //   10111          Abort abt
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               22, // RName_SPabt
               30, // RName_LRabt
               33, // RName_PC 
               34, // CPSR
               37, // SPSR_abt
               43  // array padding
               ]),
               
     // HYP MODE
     // value      encoding        mode   
         0x1A: //   11010          Hyp hyp
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               25, // RName_SPhyp
               26, // RName_LRusr
               33, // RName_PC 
               34, // CPSR
               37, // SPSR_hyp
               44  // ELR_hyp
               ]),
               
               
     // UNDEFINED MODE
     // value      encoding        mode   
         0x1B: //   11011          Undefined und
            new Int32Array([ 
               0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
               23, // RName_SPund
               31, // RName_LRund
               33, // RName_PC 
               34, // CPSR
               38, // SPSR_und
               43  // array padding
               ]),
               
               
              
      // value      encoding        mode   
      0x1F: //   11111        System sys
         new Int32Array([ 
            0,1,2,3,4,5,6,7,8,10,12,14,16, // RName_0usr - RName_12usr
            18, // RName_SPusr
            26, // RName_LRusr
            33, // RName_PC 
            34, // CPSR
            42, // array padding
            43  // array padding
            ]),
         
      };
      
      this.modes = M;
      
      
      var T = 0xFFFFFFFF;
      var A = 0;
      var B = 0;
      this.cycle = function(){
         var instr = 0;
         var ic = this.instructionsCount;
         var PC = this.PC;
         var M = this.M;
         for(var i = 0; i < ic; i++){
            A++;
            A&=T;
            this.c = A;
            if(!(A>B)){
               console.log('CPU-HALT! ERROR',A,B);
               cpu.turnOff();
               throw new Error('CPU HALTED! ERROR');
            }
            B=A;
         }
      };
      
      ARMv7_CPU.superclass.constructor.call(this, "memory", R, 
         "instructions", config.clock, config.instructionsPerCycle);
   };
   
   
   
   libDraw.ext(ARMv7_CPU, CPU);
   
   
   
   
   
   
   // //////////////////////////////////////////////////////////////////////////
   
   // --------------------------------------------------------------------------
   
   
   
   var PropertyMonitor = function(cfg){
       var holder = cfg.holder || document.body;
       var watch = cfg.watch || [];
       var interval = cfg.interval || 1000;
       var self = this;
       this.watched = {};
       
       this.el = $('<div class="monitor-wrapper"></div>')[0];
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
       
       this.clock = PropertyMonitor.__CLOCK_POOL[interval];
       if(!this.clock){
         this.clock = new libDraw.pkg.timer.Clock({
            interval: interval,
            mode: 'interval'
         });
         PropertyMonitor.__CLOCK_POOL[interval] = this.clock;
       }
       this.clock.addHandler(function(){
          for(var  i = 0; i < watch.length; i++){
             watch[i].monitor.call(watch[i]);
          }
       }, this);
       
   };   
   
   PropertyMonitor.__CLOCK_POOL={};
   
   libDraw.ext(PropertyMonitor, {
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
   
   
   
   
   
   
   $(document).ready(function(){
      var interval = 50; // ~20Hz
      var mode = 'interval'; // 
      var insCnt = 1000; // instructions count per cycle
      var fac = 10000;
      var threshold = 0.1;
      
      var c1 = new libDraw.pkg.timer.Clock({
         interval:interval,
         mode: mode,
         range: 100
      });
      
      
      
      cpu = new ARMv7_CPU({
         clock: c1,
         instructionsPerCycle: 20000
      });
      
      var maxUsage = 0.8;
      var a = 0;
      cpu.turnOn();
      mon = new PropertyMonitor({
         holder: $('#monitor')[0],
         interval: 1000/8,
         watch: [
            {
               target: cpu,
               label: 'SPEED: ',
               property: function(){
                  return (this.getSpeed()/1000000) + 'MIPS';
               }
            },
            {
               target: cpu,
               label: 'USAGE: ',
               property: function(){
                  return (this.getUsage()*100).toFixed(2) + "%";
               }
            },
            {
               target: cpu,
               label: 'TICKS (e9): ',
               property: function(){
                  return (this.c/1000000000);
               }
            },
            {
               target: cpu,
               label: 'Fix: ',
               property: function(){
                  var ic = this.instructionsCount;
                  var usage = this.getUsage();
                  var val = '';//'['+usage+']';
                  
                  if(usage > 0){
                     var fix = Math.floor(((maxUsage-usage)/maxUsage) * ic);
                    // if(fix > 5000)
                    //    fix = 5000;
                    // else if(fix < -5000)
                    //    fix = -5000;
                        
                    // this.instructionsCount +=fix;
                     val += fix;
                     if(fix > 0){
                        val+='&uarr;';
                     }else{
                        val +='&darr;';
                     }
                  }else{
                     val+='no-fix';
                  }
                  return val;
               }
            }
         ]
      });
      
      
      mon.watch();
   });
})(jQuery);
