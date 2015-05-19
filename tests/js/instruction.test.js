def('instruction-test', 
['unit:test:suite','risc.core.instruction'], 
function(suite, instruction){
    suite('Instruction Set Tests', 'instruction tests', function(usecase){
        usecase('InstructionFormat', 'Instruction format specification',
        function(ok, log){
            
            log.setLevel('trace');
            
            var format = "1100 0011 {varA: 4} {varB:4} 1111 0000";
            log.info('Instruction specification: ', format);
            var fmt = new instruction.InstructionFormat(format);
            log.debug('Format: ', JSON.stringify(fmt, null, 2));
        });
        
        usecase('InstructionFormat-2','Parse format specs', function(ok, log){
            log.setLevel('trace');
            
            var format = "1100 0011 {varA: 4} {varB:4} 1111 0000";
            log.info('Instruction specification: ', format);
            var fmt = new instruction.InstructionFormat(format);
            log.debug('Format: ', fmt);
        });
        
        usecase('Lexer', 'Lexer.nextToken()', function(ok, log){
            var tc = '|{}[]';
            var str = 'token-1|token-2|[token-3|token-4]{token-5}';
            var lexer = new instruction.Lexer(tc, str);
            var token = undefined;
            while(token = lexer.nextToken()){
                log.info('Token:', token);
            }
        });
        
        usecase('Lexer.tokenize', 'Lexer.tokenize() static method', 
                    function(ok, log, expect){
            var tc = '|{}[]';
            var str = 'token-1|token-2[token-3]{token-4}';
            var tokens = instruction.Lexer.tokenize(str, tc);
            ok(tokens, 'Tokens array must be defined');
            log.debug('tokens.length: ', tokens.length);
            expect(tokens.length, 5, 'Expected 5 tokens');
            expect(tokens[0], 'token-1', 'Expected token-1');
            expect(tokens[1], 'token-2');
            expect(tokens[2], 'token-3');
            expect(tokens[3], '', 'An empty token was expected');
            expect(tokens[4], 'token-4');
        });
        
    });
});
