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
         try{
            for(var i = 0; i < ic; i++){
               instr = M[PC]; // fetch
               this.execInstr(instr);
               console.log(ds.instructionToString(instr));
               //console.log(helpers.memToHex(cpu.M).join('\n'));
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
   
   
   
   libDraw.ext(ARMv7_CPU, CPU,{
      toString: function(){
         return 'ARMv7 Processor Core';
      }
   });
   
   helpers = {
      __HEX: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'],
      bToHex: function(b){
         return helpers.__HEX[(b>>4)&0xF] + 
            helpers.__HEX[b&0xF];
      },
      hwToHex: function(halfWord){
         return helpers.bToHex(halfWord>>8)+' '
            +helpers.bToHex(halfWord);
      },
      wToHex: function(word){
         return helpers.hwToHex(word>>16) + ' ' + helpers.hwToHex(word);
      },
      memToHex: function(mem, align, start, end){
         align = align || 4;
         start = start || 0;
         end = end || mem.length;
         var ret = [];
         var toHex = helpers.wToHex;
         if(align == 2)
            toHex = helpers.hwToHex;
         else if (align == 1)
            toHex = helpers.bToHex;
            
         for(var i = start; i < end; i++){
            ret.push(i+'. ' + toHex(mem[i]));
         }
         
         return ret;
      }
   };
   
   /////////////////////////////////////////////////////////////////////////////
   // Dummy processor
   
   /*
   Registers:
   000  (0)- A0 - general purpose
   001  (1)- A1 - genral purpose
   010  (2)- A2 - general purpose
   011  (3)- A3 - general purpose
   100  (4)- PC - program counter
   101  (5)- SR - processor status register
   110  (6)- DI - data in 
   111  (7)- DO - Data out
   
   
   Status Register:
      [31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0]
                                                                                            X  O  C  Z
                                                                                               
         Z - Zero flag
         C - Carry Flag
         O - Overflow flag
         X - Exception flag
   
   Instruction Set:
   
   Instruction format:
      - 32 bit
      - [31 30 29 28  27 26 25 24  23 22 21 20  19 18 17 16  15 14 13 12  11 10  9  8   7  6  5  4   3  2  1  0]
      - [  opcode  ] [ <R>   ][  <R2>  ] [ <R3>  ] [ value                                                     ]
   0000  (0) - OR  <R1> <R2> <R3> - bitwise OR: R3=R1|R2
   0001  (1) - MVI <R> V - move immediate to register <R> value: 
   0010  (2) - MOV <R1> <R2> - move <R2> to <R1>
   0011  (3) - ADD <R1> <R2> <R3> - add R2 to R1 and save to R3
   0100  (4) - SUB <R1> <R2> <R3> - subtract R1 from R2 and store to R3
   0101  (5) - SR  <R1> <R2> <R3>- shift right R1 for R2 places and store to R3
   0110  (6) - SL  <R1> <R2> <R3>- shift left R1 for R2 places and store to R3
   0111  (7) - LOAD <R>          - load from memory address pointed in register DI (6) into R
   1000  (8) - STORE <R>         - save the value from R into memory address pointed in DO (7)
   1001  (9) - JZ   <R>          - if ZERO flag == 1, jump to memory location stored in <R>
   1010  (A) - NOT <R1>  <R2>     - bitwise negation of R1 and store to R2 (R2=~R1)
   1011  (B) - MUL <R1> <R2> <R3> - multiply R1 with R2 and store to R3
   1100  (C) - DIV <R1> <R2> <R3> - divide R2 by R1 and store to R3
   1101  (D) - XOR <R1> <R2> <R3> - bitwise XOR: R3=R1^R2
   1110  (E) - AND <R1> <R2> <R3> - bitwise AND: R3=R1&R2
   1111  (F) - HLT               - halt
   */
   
   DIS_Program = function(){
      var instructions = [];
      var OPCODES = {
         "OR":     0x0,
         "MVI":    0x1,
         "MOV":0x2,
         "ADD":0x3,
         "SUB":0x4,
         "SR":0x5,
         "SL":0x6,
         "LOAD":0x7,
         "STORE":0x8,
         "JZ":0x9,
         "NOT":0xA,
         "MUL":0xB,
         "DIV":0xC,
         "XOR":0xD,
         "AND":0xE,
         "HLT":0xF
      };
      var A_OPCODES = ["OR","MVI","MOV","ADD", "SUB", "SR", "SL", 
         "LOAD", "STORE", "JZ","NOT", "MUL", "DIV",  "XOR", "AND", "HLT"];
      
      var REGISTERS = {
         "A0":0,
         "A1":1,
         "A2":2,
         "A3":3,
         "PC":4,
         "SR":5,
         "DI":6,
         "DO":7
      };
      
      var A_REGISTERS = ["A0","A1","A2","A3","PC","SR","DI","DO" ];
      
      var INS_MASK     =0xF0000000,
          R1_MASK      =0x0E000000,
          R2_MASK      =0x01C00000,
          R3_MASK      =0x00380000,
          VAL_MASK     =0x0007FFFF;
      
      var getRegister = function(r){
         var reg = REGISTERS[r];
         if(reg === undefined){
            throw new Error("Unknown register: " + r);
         }
         return reg;
      };
      this.putInstruction = function(opcode, r1, r2, r3, value){
         var opcode = OPCODES[opcode];
         if(opcode === undefined){
            throw new Error("Unknown opcode: " + opcode);
         }
         r1 = getRegister(r1);
         r2 = getRegister(r2);
         r3 = getRegister(r3);
         if(r3 == 5){
            throw new Error("Cannot store to SR!");
         }
         value = value&0x7ffff;
         var i = value;
         i|=(opcode&0xf)<<28;
         i|=(r1&0x7)<<25;
         i|=(r2&0x7)<<22;
         i|=(r3&0x7)<<19;
         instructions.push(i);
      };
      
      this.instructionToString = function(i){
         var opcode = A_OPCODES[(i>>28)&0xF];
         var r1 = A_REGISTERS[(i>>25)&0x7];
         var r2 = A_REGISTERS[(i>>22)&0x7];
         var r3 = A_REGISTERS[(i>>19)&0x7];
         var value = ' | '+helpers.wToHex(i&VAL_MASK);
         return [opcode,r1,r2,r3,value].join(' ');
      };
      
      this.or = function(r1,r2,r3){
         this.putInstruction('OR',r1,r2,r3,0);
      };
      this.mvi = function(r1,value){
         this.putInstruction('MVI',r1,"A0","A0",value);
      };
      this.mov = function(r1,r2){
         this.putInstruction('MOV',r1,r2,"A0",0);
      };
      this.add = function(r1,r2,r3){
         this.putInstruction('ADD',r1,r2,r3,0);
      };
      this.sub = function(r1,r2,r3){
         this.putInstruction('SUB',r1,r2,r3,0);
      };
      this.sr = function(r1,r2,r3){
         this.putInstruction('SR',r1,r2,r3,0);
      };
      this.sl = function(r1,r2,r3){
         this.putInstruction('SL',r1,r2,r3,0);
      };
      this.load = function(r){
         this.putInstruction('LOAD',r,"A0","A0",0);
      };
      this.store = function(r){
         this.putInstruction('STORE',r,"A0","A0",0);
      };
      this.jz = function(r){
         this.putInstruction('JZ',r,"A0","A0",0);
      };
      this.not = function(r1,r2){
         this.putInstruction('NOT',r1,r2,"A0",0);
      };
      this.mul = function(r1,r2,r3){
         this.putInstruction('MUL',r1,r2,r3,0);
      };
      this.div = function(r1,r2,r3){
         this.putInstruction('DIV',r1,r2,r3,0);
      };
      this.xor = function(r1,r2,r3){
         this.putInstruction('XOR',r1,r2,r3,0);
      };
      this.and = function(r1,r2,r3){
         this.putInstruction('AND',r1,r2,r3,0);
      };
      this.hlt = function(){
         this.putInstruction('HLT',"A0","A0","A0",0);
      };
      
      this.decode = function(mem, start, end){
         start = start || 0;
         end = end || mem.length;
         var decoded = [];
         for(var  i = start; i< end; i++){
            decoded.push(this.instructionToString(mem[i]));
         }
         return decoded;
      }
      
      this.storeProgram = function(mem, start){
         start = start || 0;
         for(var i = 0; i < instructions.length; i++){
            mem[i+start] = instructions[i];
         }
      };
   };
   
   var DummyCPU = function(config){
      var clock = new libDraw.pkg.timer.Clock({
         interval: config.loopInterval,
         range: config.sampleInterval || 100
      });
      
      
      var inst = 0x0, r1=0x0,r2=0x0,r3=0x0,v=0x0, result=0x0;
      var INS_MASK     =0xF0000000,
          R1_MASK      =0x0E000000,
          R2_MASK      =0x01C00000,
          R3_MASK      =0x00380000,
          VAL_MASK     =0x0007FFFF,
          Z_FLAG_MASK  =0x00000001,
          NZ_FLAG_MASK =0xFFFFFFFE,  
          C_FLAG_MASK  =0x00000002,
          NC_FLAG_MASK =0xFFFFFFFD,  
          O_FLAG_MASK  =0x00000004,
          NO_FLAG_MASK =0xFFFFFFFB,  
          X_FLAG_MASK  =0x00000008,
          NX_FLAG_MASK =0xFFFFFFF7,  
          MAX_MASK     =0xFFFFFFFF;
      var R = [];//this.R;
      var PC = 0x4,
          SR = 0x5,
          DI = 0x6,
          DO = 0x7;
      var instr = 0;
      this.cycle = function(tick){
         
         var ic = this.instructionsCount;
         var M = this.M;
         var R = this.R;
         try{
            for(var i = 0; i < ic; i++){
               
               instr = M[R[PC]];
               inst=(instr>>28)&0xF;
               r1  =(instr>>25)&0x7;
               r2  =(instr>>22)&0x7;
               r3  =(instr>>19)&0x7;
               v   =(instr&VAL_MASK);
               switch(inst){
                  case 0x0: // 0000  (0) - OR  <R1> <R2> <R3> - bitwise OR: R3=R1|R2
                     result = R[r1]|R[r2];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                     
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x1: // 0001  (1) - MVI <R> V - move immediate to register <R> value: 
                     R[r1]=v;
                     break;
                  case 0x2: // 0010  (2) - MOV <R1> <R2> - move <R2> to <R1>
                     R[r1] = R[r2];
                     break;
                  case 0x3: // 0011  (3) - ADD <R1> <R2> <R3> - add R2 to R1 and save to R3
                     result = R[r1]+R[r2];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                     
                     // set carry flag
                     if(R[r1]|R[r2])
                        R[SR] |= C_FLAG_MASK;
                     else
                        R[SR] &= NC_FLAG_MASK;
                        
                     // set overflow flag
                     if(result > MAX_MASK)
                        R[SR] |= O_FLAG_MASK;
                     else
                        R[SR] &= NO_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x4: // 0100  (4) - SUB <R1> <R2> <R3> - subtract R1 from R2 and store to R3
                     result = R[r2]-R[r1];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     // set overflow flag - here underflow
                     if(result < 0)
                        R[SR] |= O_FLAG_MASK;
                     else
                        R[SR] &= NO_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x5: // 0101  (5) - SR  <R1> <R2> <R3>- shift right R1 for R2 places and store to R3
                     result = R[r1]>>(R[r2]&0x1f);
                     // set zero flag
                    if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x6: // (6) - SL  <R1> <R2> <R3>- shift left R1 for R2 places and store to R3
                     result = R[r1]<<(R[r2]&0x1f);
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x7: // (7) - LOAD <R>          - load from memory address pointed in register DI (6) into R
                     R[r1]=this.M[R[DI]];
                     break;
                  case 0x8: // 1000  (8) - STORE <R>         - save the value from R into memory address pointed in DO (7)
                     this.M[R[DO]] = R[r1];
                     break;
                  case 0x9: // 1001  (9) - JZ   <R>          - if ZERO flag == 1, jump to memory location stored in <R>
                     if(R[SR]&&Z_FLAG_MASK ){
                        R[PC] = R[r1];
                        this.PC = R[PC];
                        continue;
                     }
                     break;
                  case 0xA: // 1010  (A) - NOT <R1>  <R2>     - bitwise negation of R1 and store to R2 (R2=~R1)
                     result = ~R[r1];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r2] = (result&MAX_MASK);
                     break;
                  case 0xB: // 1011  (B) - MUL <R1> <R2> <R3> - multiply R1 with R2 and store to R3
                     result = R[r1]*R[r2];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                     
                        
                     // set overflow flag
                     if(result > MAX_MASK)
                        R[SR] |= O_FLAG_MASK;
                     else
                        R[SR] &= NO_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0xC: // 1100  (C) - DIV <R1> <R2> <R3> - divide R2 by R1 and store to R3
                     if(R[r2] == 0){
                        // divide by zero ... set exception flag
                        R[SR] |= X_FLAG_MASK;
                        break;
                     }else{
                        R[SR] &= NX_FLAG_MASK;
                     }
                     result = Math.floor(R[r1]/R[r2]);
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0xD: //  1101  (D) - XOR <R1> <R2> <R3> - bitwise XOR: R3=R1^R2
                     result = R[r1]^R[r2];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0xE: // 1110  (E) - AND <R1> <R2> <R3> - bitwise AND: R3=R1&R2
                     result = R[r1]&R[r2];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0xF: //  1111  (F) - HLT               - halt
                     this.turnOff();
                     this.halt('HLT');
                     continue;
       
               }
               R[PC]++;
               this.PC = R[PC];
            } // end for loop
         }catch(e){
            console.error("CPU HALTED ", e);
            this.turnOff();
         }
      };
      
      
      DummyCPU.superclass.constructor.call(
         this,
         
         
         new Int32Array(config.memorySize),
         new Int32Array(8),
         [],
         clock,
         config.instructionsCount
      );
   };
   
   libDraw.ext(DummyCPU, CPU,{
      halt: function(msg){
         console.log('CPU HAS HALTED: ' , msg);
         console.log('---------------------------------');
         console.log(' CPU START ');
         console.log(helpers.memToHex(cpu.M).join('\n'));
         this.turnOff();
      },
      toString: function(){
         return "DUMMY CPU";
      }
   });
   
   
   
   // //////////////////////////////////////////////////////////////////////////
   
   // --------------------------------------------------------------------------
   
   
   
   var PropertyMonitor = function(cfg){
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
   
   
   var CPUMonitor = function(config){
      CPUMonitor.superclass.constructor.call(this, config);
   };
   
   
   
   $(document).ready(function(){
      var interval = 30; // ~20Hz
      var mode = 'interval'; // 
      var insCnt = 145000; // instructions count per cycle
      var fac = 10000;
      var threshold = 0.1;
      
      var c1 = new libDraw.pkg.timer.Clock({
         interval:interval,
         mode: mode,
         range: 300
      });
      
      
      /*
      cpu = new ARMv7_CPU({
         clock: c1,
         instructionsPerCycle: 20000
      });
      */
      cpu = new DummyCPU({
         memorySize: 16,
         instructionsCount: insCnt,
         loopInterval: interval,
         sampleInterval: 300
      });
      var maxUsage = 0.8;
      var a = 0;
      
      mon = new PropertyMonitor({
         name: cpu,
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
      var mem = [];
      
      ds = new DIS_Program();
      ds.mvi("A0",10);
      ds.mvi("A1",20);
      ds.add("A1","A0","A0");
      ds.mvi("DO",0xA);
      ds.store("A0");
      ds.mvi("A0",0);
      ds.sub("A0","A0","A0");
      ds.jz("A2");
      ds.hlt();

      
      ds.storeProgram(cpu.M);
      console.log(ds.decode(cpu.M).join('\n'));
      console.log(helpers.memToHex(cpu.M).join('\n'));
      console.log('---------------------------------');
      console.log(' CPU START ');
      cpu.turnOn();
      //debugger
      
     // cpu.cycle(0);
    //  cpu.cycle(1);
      /*cpu.cycle(2);
      cpu.cycle(3);
      cpu.cycle(4);
      cpu.cycle(5);
      cpu.cycle(6);
      
      cpu.cycle(7);
      cpu.cycle(8);*/
//      var dissasm = ds.decode(cpu.M);
//      console.log(dissasm.join('\n'));
      
   });
})(jQuery);
