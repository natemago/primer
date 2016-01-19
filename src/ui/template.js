/**
 * HTM5 Template manipulation and management
 */
(function(){
  def('ui.template', ['$', 'oop', 'utils:each', 'risc.util.UUID', 'fetch.Request'], function($, oop, each, UUID, request){
    var Template = function(config){
      oop.ext(this, config);
      this.id = this.id || 'template:' + UUID.randomUUID();

      this.templateEl = this._generateTemplateEl();
      this._appendTemplateEl();

    };

    oop.extend(Template, {
      _generateTemplateEl: function(){
        var templateMarkup = [
          '<template id="', this.id, '">',
          '</template>'
        ].join('');
        return $(templateMarkup)[0];
      },
      _appendTemplateEl: function(){
        $(document.body).append(this.templateEl);
      },
      initialize: function(){
        var self = this;
        if(this.initialized){
          return new Promise(function(resolve){
            resolve(self);
          });
        }
        this.__initPromise = new Promise(function(resolve, reject){
          var resolveWithContent = function(content){
            self.content = content;
            $(self.templateEl).html(content);
            self.initialized = true;
            self.__initPromise = undefined;
            resolve(self);
          };
          if(self.content !== undefined){
            resolveWithContent(self.content);
          }else if(self.url){
            request.get(self.url)
              .then(function(content){
                resolveWithContent(content);
              }).catch(function(reason){
                self.__initPromise = undefined;
                reject(reason);
              });
          }else{
            self.__initPromise = undefined;
            reject('No content or URL for template provided.');
          }
        });
      },
      createElement: function(){
        if(this.__initPromise){
          return this.__initPromise.then(function(template){
            return template.createElement();
          });
        }
        var self = this;
        return new Promise(function(resolve){
          var el = document.importNode(self.templateEl.content, true);
          resolve(el);
        });
      }
    });


    var TemplateManager = function(config){
      oop.ext(this, config);
      this.templates = {};
    };

    oop.extend(TemplateManager, {
      template: function(id){
        var tpl = this.templates[id];
        if(!tpl){
          throw new Error('No such template ' + id);
        }
        return tpl;
      },
      addTemplate: function(templateConfig){
        var self = this;
        return new Promise(function(resolve, reject){
          if(templateConfig.id && self.templates[templateConfig.id]){
            reject('Tempate with id' + templateConfig.id + ' already registered');
          }
          var template = new Template(templateConfig);
          self.templates[template.id] = template;
          return template.initialize();
        });
      }
    });


    var defaultManager = new TemplateManager({});



    return {
      template: function(config){
        return defaultManager.addTemplate(config);
      },
      templates: function(){
        return defaultManager;
      },
      element: function(fromTemplate){
        return defaultManager.template(fromTemplate).createElement();
      },
      Template: Template,
      TemplateManager: TemplateManager
    };
  });
})();
