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
      
      
   };
   libDraw.ext(CPU,{
      cycle: function(tick){
         var instr = 0;
         for(var i = 0; i < this.instructionsCount; i++){
            instr = this.M[this.PC]; // fetch
            this.execInstr(instr);
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

   */
   
   
   var ARMv7_CPU = function(){
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
      ARMv7_CPU.superclass.constructor.call(this, "memory", R, "instructions", "clock", 1000);
      
   };
   
   
   
   libDraw.ext(ARMv7_CPU, CPU);
   
   
   armv7 = new ARMv7_CPU();
   
   
   
   // //////////////////////////////////////////////////////////////////////////
   
   // --------------------------------------------------------------------------
   
   
   
   var Monitor = function(el){
      this.el = $('<div class="monitor"></div>')[0];
      el.appendChild(this.el);
      this.message = '';
   };
   
   libDraw.tools.extend(Monitor, {
      print: function(){
         for(var i = 0; i < arguments.length; i++){
            
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
         mode: mode
      });
      
      
      var A=100,B=200;
      c1.addHandler(function(){
         for(var i = 0; i < insCnt; i++){
            A=(A+B)%B;
            A=(A+B)%B;
            A=(A+B)%B;
            A=(A+B)%B;
            if(A>100)
               A=(A+B)%B;
         }
      });
      
      
      var mc = new libDraw.pkg.timer.Clock({
         interval: 1000/3, // ~3Hz
         mode: 'interval'
      });
      
      mc.addHandler(function(){
         var m = c1.getMeasure();
         var mips = ( (m.frequency||0) * insCnt)/1000000;
         M.clear();
         M.print('MIPS: ',mips,'<br/>');
         M.print('Freq: ',(m.frequency||0).toFixed(2),'Hz<br/>');
         M.print(' IpC: ',insCnt,'<br/>');
         M.print(' Usg: ',(m.usage? m.usage.usage*100:'NA'),'%<br/>');
         if(m.usage){
            if(m.usage.usage < threshold){
               insCnt+=fac;
            }else if(m.usage.usage > threshold){
               insCnt-=(fac/2);
            }
         }
      });
      
      
      c1.start();
      mc.start();
      
      
      M = {
         div: $('#monitor')[0],
         clear: function(){M.div.innerHTML = '';},
         print: function(){
            var m = '';
            for(var i = 0; i < arguments.length; i++){
               m+=arguments[i];
            }
            M.div.innerHTML+=m;
         }
      };
   });
})(jQuery);
