(function($){
   arm7 = new risc.arm.ARMv7_CPU({
      clockFreq: 20,
      memSize: 1024*1024, // 4MiB od memory
      instructionsPerCycle: 100000
   });
})(jQuery);
