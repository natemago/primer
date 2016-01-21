/**
 * API for binding data to view (and back)
 */
(function(){
  def('ui.linker', ['$', 'oop'], function($, oop){

    var Linked = function(config){
      oop.ext(this, config);
    };

    oop.extend(Linked, {
      link: function(){

      }
    });

    var Linker = function(){};

    oop.extend(Linker, {
      link: function(el, context){

      }
    });

    return {
      Linker: Linker
    };
  });
})();
