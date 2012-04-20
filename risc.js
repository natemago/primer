(function($){
   $(document).ready(function(){
      var interval = 50; // ~20Hz
      var mode = 'interval'; // 
      var insCnt = 1000; // instructions count per cycle
      var fac = 10000;
      var threshold = 0.1;
      
      var c1 = new libDraw.pkg.timer.Clock({
         interval:interval,
         mode: mode
      });
      
      
      var A=100,B=200;
      c1.addHandler(function(){
         for(var i = 0; i < insCnt; i++){
            A=(A+B)%B;
            A=(A+B)%B;
            A=(A+B)%B;
            A=(A+B)%B;
            if(A>100)
               A=(A+B)%B;
         }
      });
      
      
      var mc = new libDraw.pkg.timer.Clock({
         interval: 1000/3, // ~3Hz
         mode: 'interval'
      });
      
      mc.addHandler(function(){
         var m = c1.getMeasure();
         var mips = ( (m.frequency||0) * insCnt)/1000000;
         M.clear();
         M.print('MIPS: ',mips,'<br/>');
         M.print('Freq: ',(m.frequency||0).toFixed(2),'Hz<br/>');
         M.print(' IpC: ',insCnt,'<br/>');
         M.print(' Usg: ',(m.usage? m.usage.usage*100:'NA'),'%<br/>');
         if(m.usage){
            if(m.usage.usage < threshold){
               insCnt+=fac;
            }else if(m.usage.usage > threshold){
               insCnt-=(fac/2);
            }
         }
      });
      
      
      c1.start();
      mc.start();
      
      
      M = {
         div: $('#monitor')[0],
         clear: function(){M.div.innerHTML = '';},
         print: function(){
            var m = '';
            for(var i = 0; i < arguments.length; i++){
               m+=arguments[i];
            }
            M.div.innerHTML+=m;
         }
      };
   });
})(jQuery);
