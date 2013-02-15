(function($){
   if(!risc.arm)
      throw new Error("Namespace: 'risc.arm' is missing.");


   var ARM_GROUPS = {
      
   };

   var ARMInstructionSet = function(config){
      ARMInstructionSet.superclass.constructor.call(this, config);
      var g = this.groups = {};
   };

   libDraw.ext(ARMInstructionSet, risc.arm.InstructionSet);
   libDraw.ext(ARMInstructionSet, {
      addi: function(group, cnf){

      }
   });
  
  
})(jQuery);
