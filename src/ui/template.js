/**
 * HTM5 Template manipulation and management
 */
(function(){
  def('ui.template', ['$', 'oop', 'utils:each', 'risc.util.UUID'], function($, oop, each, UUID){
    var Template = function(config){
      oop.ext(this, config);
      this.id = this.id || 'template:' + UUID.randomUUID();
    };

    oop.extend(Template, {
      createElement: function(){

      }
    });


    var TemplateManager = function(config){
      oop.ext(this, config);
    };

    oop.extend(TemplateManager, {
      addTemplate: function(templateConfig){

      }
    });


    var defaultManager = new TemplateManager({});



    return {
      template: function(config){
        return defaultManager.addTemplate(config);
      },
      templates: function(){
        return defaultManager;
      }
    };
  });
})();
