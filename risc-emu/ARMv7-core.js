/**
 * ARMv7-A architecture processor emulator
 */
(function($){
   libDraw.ns('risc.arm');
   
   
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
   
   /*
   config properties: 
      - clock - libDraw.pkg.timer.Clock object. This is the main CPU clock which
           may be shared with other devices.
      - clockFreq - if clock is not supplied, you can supply the clock frequency
          and a default clock will be instantiated.
      - memory - system memory - this needs to be a Int32Array
      - memSize - size of the memory, new Int32Array with this size will be 
          created. Note that the size is in words (32 bit) not bytes.
      - instructionsPerCycle - how many instructions per cycle to process. The 
          total MIPS can be calculated as clock.frequency * instructionsPerCycle
      */
   risc.arm.ARMv7_CPU = function(config){
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
      
      if(config.clockFreq && !config.clock){
         config.clock = new libDraw.pkg.timer.Clock({
               interval: Math.floor(1000/config.clockFreq),
               mode: 'interval',
               range: 300 // 3 Hz stats update
            });
      }
      
      if(!config.clockFreq && !config.clock){
         throw new Error("No external clock!");
      }
      
      var memory = config.memory || new Int32Array(config.memSize);
      
      this.state = risc.arm.ARMv7_CPU.INSTRUCTION_SETS["ARM"];
      
      risc.arm.ARMv7_CPU.superclass.constructor.call(this, memory, R, 
         "instructions", config.clock, config.instructionsPerCycle);
   };
   
   risc.arm.ARMv7_CPU.INSTRUCTION_SETS = {
      "ARM": 0,
      "Thumb": 1,
      "ThumbEE": 2,
      "Jazelle": 3,
      "JVM": 3
   };
   
   libDraw.ext(risc.arm.ARMv7_CPU, risc.core.CPU,{
      toString: function(){
         var b = this.bips();
         var s = 'ARMv7 Processor Core';
         var es = this.clock.getEstimatedSpeed();
         if(b && es){
            s += ' @ ' + es.toFixed(2) + 'Hz [BMIPS: ' + (b/1000000) + ']';
         }
         return s;
      },
      bips: function(){
         var s = this.clock.getEstimatedSpeed();
         if(!isNaN(s) && s!=undefined){
            return (s*this.instructionsCount);
         }
         return undefined;
      },
      changeState: function(s){
         this.state = risc.arm.ARMv7_CPU.INSTRUCTION_SETS[s];
         if(!this.state){
            throw new Error("Invalid state: [" + s + "]");
         }
      }
   });
   
   
   // --------------------------------------------------------------------------
   // ---------- The Instruction Sets ------------------------------------------
   // --------------------------------------------------------------------------
   
   
   /* Build uppon the following generalized pipeline phases:
       1. Fetch
       2. Decode
       3. Execute
       4. Write Back
    */
   var InstructionSetBuilder = function(config){
      libDraw.ext(this, config);
      this.instructions = [];
      this.cycleTemplate = this.cycleTemplate 
         || InstructionSetBuilder.DEFAULT_CYCLE_TEMPLATES;
         
      this.stages = {
         'PREPARE_CYCLE': [
            // setup the registers for the specified mode
            'var REGS = this.modes[this.currentMode];'
         ].join('\n'),
         'FINISH_CYCLE': '// do nothing',
         'CYCLE_COUNT_EXPR': 'this.instructionsCount',
         'PIPELINE': [
            '@P_FETCH@',
            '@P_DECODE@',
            '@P_EXECUTE@',
            '@P_WRITE_BACK@'
         ].join('\n'),
         
      };
      this.pipeline = {
         'P_FETCH': 'var INST = this.M[this.PC];',
         'P_DECODE': '@set.decodeProc()@',
         'P_EXECUTE': [
            'switch(OP){',
               '#for(var i = 0; i < set.instructions.length; i++){#',
                  'case @set.instructions[i].opcode@:{',
                     '@set.instructions[i].procedure(type)@',
                     'break;',
                  '}',
               '#}#',
               'default:{',
               '  throw new Error("Invalid instruction: " + OP);',
               '}',
            '}'
         ].join('\n'),
         'P_WRITE_BACK': ''
      };
      this.set = {};
   };
   
   InstructionSetBuilder.DEFAULT_CYCLE_TEMPLATES = {
      'EXECUTION':[
            '@PREPARE_CYCLE@',
            'var BR_CYCLE = false;',
            'var BR_OUT = false;',
            'for (var i = 0; i < @CYCLE_COUNT_EXPR@; i++) {',
               '@PIPELINE@',
               'if(BR_CYCLE)break;',
            '}',
            'if(BR_OUT)return;',
            '@FINISH_CYCLE@'
         ].join('\n'),
      'STEP': [].join('\n'),
      'DEBUG': [].join('\n')
   };
   
   libDraw.ext(InstructionSetBuilder,{
      
      /**
       * @method build - builds the "cycle" method for the virtual CPU for
       *                   this instruction set.
       */
      build: function(mode, iSet){
         var cycleTemplate = new x.util.Template({
            template: this.cycleTemplate[mode]
         });
         var stagesContext = libDraw.ext({},this.stages);
         stagesContext["set"] = this.sets[iSet];
         stagesContext["type"] = mode;
         libDraw.each(this.pipeline, function(t,pn){
            var tx = new x.util.Template({template: t});
            stagesContext[pn] = tx.merge(stagesContext);
         }, this);
         stagesContext["PIPELINE"] = 
            (new x.util.Template({template:this.stages["PIPELINE"]})).
               merge(stagesContext);
         
         var cycleBody = cycleTemplate.merge(stagesContext);
         try{
            /*
             * Build with the __RCT paramater
             *   - __RCT - (Realtime Clock Tick) the clock tick number of the real clock...
             */ 
            var cycle = new Function('__RCT', cycleBody);
            console.log('Cycle Body:\n', cycleBody);
            console.log('Cycle function:\n', cycle);
            return cycle;
         }catch(ex){
            throw ex;
         }
         return undefined;
      },
      
      /**
       * @method assembler - generates the assembler/disassembler for this 
       *                     instruction set.
       */
      assembler: function(){},
      
      prepare: function(expression){
         this.defineStage('PREPARE_CYCLE', expression);
      },
      finish: function(expression){
         this.defineStage('FINISH_CYCLE', expression);
      },
      defineStage: function(stage, expression){
         this.stages[stage] = expression;
      },
      
      defFetch: function(){},
      defDecode: function(){},
      defExecute: function(){},
      // defExecute alias
      def: function(){
         this.defExecute.apply(this, arguments);
      },
      defWriteBack: function(){},
      setPhases: function(){}
   });
   
   
   var ARMInstruction = function(config){
      libDraw.ext(this, config);
   };
   libDraw.ext(ARMInstruction, {
      decode: function(){},
      exec: function(){},
      write: function(){},
      reg: function(regName){},
      procedure: function(){}
   });
   
   
   var ARM_InstructionSetsBuilder = function(config){
      ARM_InstructionSetsBuilder.superclass.constructor.call(this, config);
      this.pipeline["DECODE"] = [
         'var cond = (INST & 0xF0000000)>>28;',
         'var grp  = (INST & 0x0E000000)>>25;', // ARM group ...
      ].join('\n');
      this.name = "ARM";
      this.instructions = [];
   };
   
   libDraw.ext(ARM_InstructionSetsBuilder, InstructionSetBuilder);
   libDraw.ext(ARM_InstructionSetsBuilder, {
      adddpm: function(mnem, cond, op, op1, op2, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: cond,
            op: op,
            op1: op1,
            op2: op2,
            proc: proc,
            group: 0x0 | op // 0b00[0] and 0b00[1]
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      },
      addls: function(mnem, cond, A, op1, Rn, B, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: cond,
            A: A,
            op1: op1,
            Rn: Rn,
            B: B,
            proc: proc,
            group: 0x1 | A // 0b00[0] and 0b00[1]
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      },
      addmedia: function(mnem, cond, op1, Rd, op2, Rn, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: cond,
            op1: op1,
            Rd: Rd,
            op2: op2,
            Rn: Rn,
            proc: proc,
            group: 0x3 // 0b011
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      },
      addbranch: function(mnem, op, Rn, R, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: cond,
            op: op,
            Rn: Rn,
            R: R,
            proc: proc,
            group: 0x1 | A // 0b00[0] and 0b00[1]
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      },
      addcop: function(mnem, cond, op1, Rn, coproc, op, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: cond,
            op: op,
            op1: op1,
            Rn: Rn,
            coproc: coproc,
            proc: proc,
            group: 0x1 | A // 0b00[0] and 0b00[1]
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      },
      adduncond:function(mnem, op1, Rn, op, proc, ex){
         var cfg = {
            mnemonic: mnem,
            condition: 0xF, // 0b1111
            op1: op1,
            Rn: Rn,
            op: op,
            proc: proc,
            group: 0x1 | A // 0b00[0] and 0b00[1]
         };
         libDraw.ext(cfg, ext || {});
         this.instructions.push(new ARMInstruction(cfg));
      }
   });
   
   // ===============================
   // ===== ARM Instruction Set =====
   // ===============================
   
   
   // -------------------------------
   
   
   // ===============================
   // ==== Thumb Instruction Set ====
   // ===============================
   
   
   
   
   // -------------------------------
   
   // ===============================
   // === ThumbEE Instruction Set ===
   // ===============================
   
   
   
   
   // -------------------------------
   
   
})(jQuery);
