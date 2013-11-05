(function(){
    // This is the private space of the module. 
    // Static variables can be set here or helper functions, all private to 
    // this module and invisible to the others.
    
    // === risc.core.CPU module ===
    def('risc.core.CPU', // module name
        ['$','libDraw'], // depends on: $ (jQuery) and libDraw
        function($, libDraw){
            // if you don't want to wrap your code with envelope annonymous 
            // function, this is the place to be used as private workspace.
            
            /**
             * Base CPU class
             */
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
           libDraw.ext(risc.core.CPU,{
              cycle: function(tick){
                 var instr = 0;
                 var ic = this.instructionsCount;
                 var PC = this.PC;
                 var M = this.M;
                 try{
                    for(var i = 0; i < ic; i++){
                       instr = M[PC]; // fetch
                       this.execInstr(instr);
                       // totally worthless cpu cycle :|
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
              },
              isRunning: function(){
                 return !this.clock.started;
              },
              // debugging fucntions
              getRegisters: function(){},
              getStatusRegisterValue: function(){},
              getProgramCounterValue: function(){
                 return this.PC;
              },
              
           });
            
            
            // this is how we expose the module to the context      
            return CPU;
        }
    );
})();
