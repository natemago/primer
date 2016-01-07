(function(){
  def('ui.components', [':$', ':oop'], function($, oop){
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
