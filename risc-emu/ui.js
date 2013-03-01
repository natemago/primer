(function($){
    
    libDraw.ns('risc.ui');
    var EventBase = function(config){
        libDraw.ext(this, config);
        this.eventHandlers = {};
        if(!this.el){
            this.el = {};
        }
        this.init();
    };
    
    libDraw.ext(EventBase, {
        init: function(){},
        on: function(event, callback){
            var ehs = this.eventHandlers[event];
            if(!ehs){
                ehs = this.eventHandlers[event] = [];
            }
            var self = this;
            var wrapper = function(){
                callback.apply(self, arguments);
            };
            ehs.push({
                callback: callback,
                wrapper: wrapper
            });
            $(this.el).bind(event, wrapper);
        },
        trigger: function(){
            var event = arguments[0];
            if(event){
                var ehs = this.eventHandlers[ehs];
                if(ehs){
                    $(this.el).trigger(event, 
                        Array.prototype.slice.call(arguments, 1));   
                }
            }
        },
        removeListener: function(event, callback){
            throw new Error("Not implemented!");
        }
    });
    
    
    var Container = function(config){
        Container.superclass.constructor.call(this, config);
    };
    libDraw.ext(Container, EventBase, {
        init: function(){
            this.parent = this.el || document.body;
            
            this.el = $(this.markup())[0];
            if(this.extraClass){
                $(this.el).addClass(this.extraClass);
            }
            if(this.width){
                $(this.el).css('width', this.width);
            }
            if(this.height){
                $(this.el).css('height', this.height);
            }
            
            $(this.parent).append(this.el);
        },
        markup: function(){
            return '<div class="ui-container"></div>';
        },
        show: function(){
            $(this.el).show();
            this.visible = true;
        },
        hide: function(){
            $(this.el).hide();
            this.visible = false;
        }
    });    
    
    var Menu = function(config){
        Menu.superclass.constructor.call(this, config);
    };
    
})(jQuery);
