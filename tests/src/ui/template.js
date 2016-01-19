(function(){
  def('ui.template', ['$', 'oop', 'utils:each', 'risc.util.UUID'], function($, oop, each, UUID){
    var Template = function(config){
      oop.ext(this, config);
      this.id = this.id || 'template:' + UUID.randomUUID();
    };

    oop.extend(Template, {

    });


    var TemplateManager = function(){
      
    };

  });
})();
