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
            log.debug('Format: ', fmt);
        });
        
        usecase('InstructionFormat-2','Parse format specs', function(ok, log){
            log.setLevel('trace');
            
            var format = "1100 0018 {varA: 4} {varB:4} 1111 0000";
            log.info('Instruction specification: ', format);
            var fmt = new instruction.InstructionFormat(format);
            log.debug('Format: ', fmt);
        });
    });
});
