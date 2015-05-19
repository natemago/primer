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
    
    /*
     * Assembly format for a single instructon.
     * MNEMONIC <REGISTER>, {var_name:type}, [<REG>,{var}], {{<R>+<R>}}
     
     General syntax:
      mnemonic_expression[reference_expression] [reference_expression|offset_expression|multireg_expression], ...
      
      mnemonic_expression: [\w_]+
      reference_expression: register_expression|variable_expression
      
      register_expression: <[\w_]+>
      variable_expression: {variable_name[:variable_type]}
      variable_name: [\w_]+
      variable_type: int|string|float
      
      offset_expression: \[reference_expression,...\]
      multireg_expression: \{\{register_expression operand register_expression\}\}
      operand: +|-|*|/|||&
     
     
    Example:
      instruction MOV:
      
      MOV <to_reg>, {{imm_value:int}}
      ex: MOV R2, #3
          MOV R0, #&C
      
      instruction BNE
      
      BNE <to_label:string>
      ex: BNE start_of_loop
      
      instruction LDR
      LDR <to_reg>, [<reg_a>, <reg_b>, {operation:string} {imm_value:int}]
      ex: LDR R2, [R1, R2, LSL #0x3]
       
     */
     
     
    var Lexer = function(termChars, str){
        var pos = 0;
        
        this.nextToken = function(){
            if(pos >= str.length){
                return undefined;
            }
            var token = '';
            var tc = '';
            while(pos < str.length){
                var c = str[pos];
                if( termChars.indexOf(c) >= 0){
                    pos++;
                    tc = c;
                    break;
                }
                token+=c;
                pos++;
            }
            return [tc, token];
        };
    };
    
    Lexer.tokenize = function(string, tokenChars){
        var tokens = [];
        var token = undefined;
        var lexer = new Lexer(tokenChars, string);
        while(token = lexer.nextToken()){
            tokens.push(token[1]);
        }
        return tokens;
    };
    
    
    var AssemblyFormat = function(spec){
        this.spec = spec;
    };
    
    libDraw.ext(AssemblyFormat, {
        parse: function(){
            
        }
    });
    
    
    return {
        InstructionFormat: InstructionFormat,
        Lexer: Lexer
    };
    
});
