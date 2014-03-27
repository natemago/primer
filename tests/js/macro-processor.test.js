def('risc.core.MacroProcessorTest', 
    ['risc.core.MacroProcessor'], function(MacroProcessor){
    mp = new MacroProcessor({});
    
    testFn = function(a1, a2, a3){
        var a14;
        a1+=3;
        return a2;
    };
    
    console.log(testFn.toString());
    mp.process(testFn, {}, {});
    
});
