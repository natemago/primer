(function(){
  def('ui.linker.ractive', ['$', 'oop', 'ui.linker'], function($, oop, linker){
    var RactiveLinkedView = function(config){
      RactiveLinkedView.superclass.constructor.call(this, config);
    };

    oop.extend(RactiveLinkedView, linker.Linked, {
      link: function(){

      }
    });


    var RactiveLinker = function(config){
      RactiveLinker.superclass.constructor.call(this, config);
    };

    oop.extend(RactiveLinker, linker.Linker, {
      link: function(el, toContext){

      }
    });


    return {
      RactiveLinkedView: RactiveLinkedView,
      RactiveLinker: RactiveLinker
    };
  });
})();
