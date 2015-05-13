def('risc.core.instruction', 
['libDraw','risc.core.MacroProcessor', 'risc.utils.str', 'risc.utils'],
function(libDraw, MacroProcessor, util, riscUtils){
    var InstructionSet = function(config){
        libDraw.ext(this, config);
    };
    
    libDraw.ext(InstructionSet, {});
    
    
    var Instruction = function(config){
        libDraw.ext(this, config);
        this.format = new InstructionFormat(config.format);
    };
    
    
    /*
    properties:
        - name - the name of the instruction
        - format - opcode specification
        - syntax - assembly syntax
        
    */
    libDraw.ext(Instruction, {
        
    });
    
    
    var InstructionFormat = function(spec){
    
        var state , opcodeMask = [], opcodeValue = [], variables = {};
        var token = '', bitPos = 32;
        for(var i = 0, c; i<spec.length; i++){
            c = spec[i];
            if(c == '{'){
                if(state == 'var'){
                    throw new Error('Invalid specification at char ' + (i+1) 
                        + '. Unclosed variable specification.');
                }
                state = 'var';
                token = '';
            }else if(c == '}'){
                if(state != 'var'){
                    throw new Error('Invalid specification at char ' + (i+1) +
                    '. Variable specification closed too early.');
                }
                var parsed = /([\w\d_]+)\s*:\s*(\d+)/g.exec(token);
                if(parsed == null){
                    throw new Error('Invalid variable specification. Char ' + (i+1));
                }
                var bits = parseInt(parsed[2] || '1');
                if( bits <= 0){
                    throw new Error('Invalid variable specification. Variable bit length must be grater than 0. Char ' + (i+1));
                }
                bitPos-=bits;
                var mask = 1;
                for(var j = 0; j < bits-1; j++){
                    mask=mask*2+1;
                    opcodeMask.push(0);
                    opcodeValue.push(0);
                }
                mask <<=bitPos;
                variables[parsed[1]] = {
                    bits: bits,
                    mask: mask,
                    maskHex: riscUtils.toHex(mask, 8) // 8 half bytes
                };
                
                state = '';
            }else if(state == 'var'){ 
                token+=c;
            }else{
                if( c == ' ' || c == '\t' ){
                    continue;
                }
                if( c != '0' && c != '1' ){
                    throw new Error('Invalid char at ' + (i+1) + '. Char: ' + c);
                }
                opcodeMask.push(1);
                opcodeValue.push(c);
                bitPos--;
            }
        }
    
        this.spec = spec;
        this.variables = variables;
        this.opcode = parseInt(opcodeValue.join(''), 2);
        this.opcodeHex = riscUtils.toHex(this.opcode, 8);
        this.opcodeMask = parseInt(opcodeMask.join(''), 2);
        this.opcodeMaskHex = riscUtils.toHex(this.opcodeMask, 8);
    };
    
    return {
        InstructionFormat: InstructionFormat
    };
    
});
