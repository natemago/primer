/**
 * Example CPU implementation.
 * Extremly simple CPU implementation, primarily for debugging purposes.
 */
(function($){

   libDraw.ns('risc.examples.excpu');

   /////////////////////////////////////////////////////////////////////////////
   // Dummy processor
   
   /*
   Registers:
   000  (0)- A0 - general purpose
   001  (1)- A1 - general purpose
   010  (2)- A2 - general purpose
   011  (3)- A3 - general purpose
   100  (4)- PC - program counter
   101  (5)- SR - processor status register
   110  (6)- DI - data in 
   111  (7)- DO - Data out
   
   
   Status Register:
      [31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0]
                                                                                            X     C  Z
                                                                                               
         Z - Zero flag
         C - Carry Flag
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
   
   risc.examples.excpu.Assembler = function(){
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
         var value = '0x'+risc.utils.toHex(i&VAL_MASK,5);
         
         switch (opcode){
            case "MVI":
               r2="";
               r3="";
               break;
            case "MOV":
               r3="";
               value="";
               break;
            case "LOAD":
            case "STORE":
            case "JZ":
               r2="";
               r3="";
               value="";
               break
            case "HLT":
               r1="";
               r2="";
               r3="";
            default:
               value = "";
         }
         
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
   
   risc.examples.excpu.DummyCPU = function(config){
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
        //  O_FLAG_MASK  =0x00000004,
        //  NO_FLAG_MASK =0xFFFFFFFB,  
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
                     if(result > MAX_MASK)
                        R[SR] |= C_FLAG_MASK;
                     else
                        R[SR] &= NC_FLAG_MASK;
                        
                     R[r3] = (result&MAX_MASK);
                     break;
                  case 0x4: // 0100  (4) - SUB <R1> <R2> <R3> - subtract R1 from R2 and store to R3
                     result = R[r2]-R[r1];
                     // set zero flag
                     if(result)
                        R[SR] &= NZ_FLAG_MASK;
                     else
                        R[SR] |= Z_FLAG_MASK;
                        
                     // set carry flag
                     if(result > MAX_MASK)
                        R[SR] |= C_FLAG_MASK;
                     else
                        R[SR] &= NC_FLAG_MASK;
                        
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
                     
                        
                     // set carry flag
                     if(result > MAX_MASK)
                        R[SR] |= C_FLAG_MASK;
                     else
                        R[SR] &= NC_FLAG_MASK;
                        
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
      
      
      risc.examples.excpu.DummyCPU.superclass.constructor.call(
         this,
         
         
         new Int32Array(config.memorySize),
         new Int32Array(8),
         [],
         clock,
         config.instructionsCount
      );
   };
   
   libDraw.ext(risc.examples.excpu.DummyCPU, risc.core.CPU,{
      halt: function(msg){
         console.log('CPU HAS HALTED: ' , msg);
         console.log('---------------------------------');
         console.log(' CPU END ');
         console.log(risc.utils.memToHex(cpu.M).join('\n'));
         this.turnOff();
         this.halted = true;
      },
      toString: function(){
         return "DUMMY CPU";
      },
      getRegisters: function(){
         return [
            {
               label: 'A0',
               value: this.R[0]
            },
            {
               label: 'A1',
               value: this.R[1]
            },
            {
               label: 'A2',
               value: this.R[2]
            },
            {
               label: 'A3',
               value: this.R[3]
            },
            {
               label: 'DI',
               value: this.R[6]
            },
            {
               label: 'DO',
               value: this.R[7]
            }
         ];
      },
      getStatusRegisterValue: function(){
         return [
            {
               label: 'Z',
               on: this.R[5]&0x1
            },
            {
               label: 'C',
               on: this.R[5]&0x2
            },
            {
               label: 'X',
               on: this.R[5]&0x8
            }
         ];
      }
   });
   
   
   
   // //////////////////////////////////////////////////////////////////////////
   
   // --------------------------------------------------------------------------
   
})(jQuery);
