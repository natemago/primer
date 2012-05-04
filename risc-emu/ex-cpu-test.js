$(document).ready(function(){
      var interval = 30; // ~20Hz
      var mode = 'interval'; // 
      var insCnt = 1;//145000; // instructions count per cycle
      var fac = 10000;
      var threshold = 0.1;
      
      var c1 = new libDraw.pkg.timer.Clock({
         interval:interval,
         mode: mode,
         range: 300
      });
      
      
      /*
      cpu = new ARMv7_CPU({
         clock: c1,
         instructionsPerCycle: 20000
      });
      */
      cpu = new risc.examples.excpu.DummyCPU({
         memorySize: 24,
         instructionsCount: insCnt,
         loopInterval: interval,
         sampleInterval: 300
      });
      var maxUsage = 0.8;
      var a = 0;
      
      mon = new risc.mon.PropertyMonitor({
         name: cpu,
         holder: $('#monitor')[0],
         interval: 1000/8,
         watch: [
            {
               target: cpu,
               label: 'SPEED: ',
               property: function(){
                  return (this.getSpeed()/1000000) + 'MIPS';
               }
            },
            {
               target: cpu,
               label: 'USAGE: ',
               property: function(){
                  return (this.getUsage()*100).toFixed(2) + "%";
               }
            },
            {
               target: cpu,
               label: 'TICKS (e9): ',
               property: function(){
                  return (this.c/1000000000);
               }
            },
            {
               target: cpu,
               label: 'Fix: ',
               property: function(){
                  var ic = this.instructionsCount;
                  var usage = this.getUsage();
                  var val = '';//'['+usage+']';
                  
                  if(usage > 0){
                     var fix = Math.floor(((maxUsage-usage)/maxUsage) * ic);
                    // if(fix > 5000)
                    //    fix = 5000;
                    // else if(fix < -5000)
                    //    fix = -5000;
                        
                    // this.instructionsCount +=fix;
                     val += fix;
                     if(fix > 0){
                        val+='&uarr;';
                     }else{
                        val +='&darr;';
                     }
                  }else{
                     val+='no-fix';
                  }
                  return val;
               }
            }
         ]
      });
      
      
      mon.watch();
      var mem = [];
      
      ds = new risc.examples.excpu.Assembler();
      ds.mvi("A0",5);
      ds.mvi("A1",2);
      ds.add("A1","A0","A0");
      ds.mvi("DO",23);
      ds.mov("DI","DO");
      ds.store("A0");
      ds.load("A0");
      ds.mvi("A1",1);
      ds.sub("A1","A0","A0");
      ds.store("A0");
      ds.mvi("A3", 15);
      ds.jz("A3"); // to HLT
      ds.mvi("A3",6);
      ds.xor("A0","A0","A0");
      ds.jz("A3");
      ds.hlt();

      
      ds.storeProgram(cpu.M);
      console.log(ds.decode(cpu.M).join('\n'));
      console.log(risc.utils.memToHex(cpu.M).join('\n'));
      console.log('---------------------------------');
      console.log(' CPU START ');
      //cpu.turnOn();
      //debugger
      
     // cpu.cycle(0);
    //  cpu.cycle(1);
      /*cpu.cycle(2);
      cpu.cycle(3);
      cpu.cycle(4);
      cpu.cycle(5);
      cpu.cycle(6);
      
      cpu.cycle(7);
      cpu.cycle(8);*/
//      var dissasm = ds.decode(cpu.M);
//      console.log(dissasm.join('\n'));
      mm = new risc.mon.MemoryMonitor({
         memory: cpu.M,
         assembler: ds
      });
      
      cm = new risc.mon.CPUMonitor({
         cpu: cpu
      });
      
      
      cc = new libDraw.pkg.timer.Clock({
         interval: 200
      });

      cc.addHandler(function(t){
         cpu.cycle(t);
         mm.remapFrom(0);
         mm.highlight(cpu.PC);
         cm.update();
         if(cpu.halted)
            cc.stop();
      });
      //cc.start();
      cm.update();
      mm.highlight(cpu.PC);
      var step=function(){
         if(cpu.halted)return;
         cpu.cycle(0);
         mm.remapFrom(0);
         mm.highlight(cpu.PC);
         cm.update();
      };
      document.body.appendChild($('<input type="button" name="STEP" id="step" value="step" style="position: absolute; top: 10px; right: 10px;"/>')[0]);
      $('#step').click(step);
      $(document).keypress(function(e){
         switch(e.which){
            case 110:
               step();
               break;
         }
      });
      
      calc = new risc.mon.Calc();
      
});
