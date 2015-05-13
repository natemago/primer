def('risc.core.instruction', 
    ['libDraw', 'jQuery'], 
    function(libDraw, $){
    
    var Instruction = function(config){};
    libDraw.ext(Instruction, {
        getDecodeProcedure: function(){},
        getOpcode: function(){},
        decode: function(word){}
    });
    
    
    var InstructionSet = function(config){
        
    };
    
    libDraw.ext(InstructionSet, {
        addInstruction: function(name, procedure, opcode){}
    });
    
    
    
});
