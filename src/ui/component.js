(function(){
  def('ui.components', [':$', 'oop', 'ui.template', 'ui.linker'], function($, oop, template, linker){
    var UIComponent = function(config){
      oop.extend(this, config);
    };

    oop.extend(UIComponent, {
      init: function(){

      }
    });

    return {
      UIComponent: UIComponent
    };
  });
})();
