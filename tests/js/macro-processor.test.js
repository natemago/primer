def('risc.core.MacroProcessorTest', 
    ['risc.core.MacroProcessor'], function(MacroProcessor){
    mp = new MacroProcessor({});
    
    testFn = function(a1, a2, a3){
        var a1;
        a1+=a3;
        return a2;
    };
    
    console.log(testFn.toString());
    macro = mp.process(testFn, 'test_macro',{});
    
    var str = [
        'this is the firs line();',
        'a1+=a3;test_macro   (pavle, mavle, "33");',
        'final line'
    ].join('\n');
    
    console.log(macro.expand(str));
});
