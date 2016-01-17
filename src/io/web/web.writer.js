(function(){
  def('io.web.writer', ['oop', 'io.writer', '$', 'text.format', 'utils:each'], function(oop, writer, $, fmt, each){
    var WebWriter = function(config){
      WebWriter.superclass.constructor.call(this, config);
      this.outputEl = $(config.outputEl);
      this.escapeHTML = this.escapeHTML === undefined ? true : this.escapeHTML;
      this.directives = oop.extend({
        logLevel: function(value, style){
          style.classes.push(value);
        },
        "class": function(value, style){
          style.classes.push(value);
        }
      }, (config.directives || {}));
    };

    oop.extend(WebWriter, writer.Writer, {
      writeEntry: function(entry){
        this.outputEl.append(this.createEntry(entry));
      },
      writeLn: function(){
        var entries = [];
        for(var i = 0; i < arguments.length; i++){
          entries.push(this.createEntry(arguments[i]));
        }
        this.outputEl.append([
          '<div class="out-line">',
          entries.join(''),
          '</div>'
        ].join(''));
      },
      createEntry: function(entry){
        entry.format = entry.format || {};
        var text = this.escape(entry.text);
        var style = this.createEntryStyle(entry);
        return this.transformToHtml(text, style);
      },
      createEntryStyle: function(entry){
        var style = {
          classes: [],
          style: ''
        };

        each(entry.format, function(value, directive){
          if(this.directives[directive]){
            this.directives[directive].call(this, value, style, directive);
          }else{
            style.style += fmt.format('{}: {};', directive, value);
          }
        }, this);

        return style;
      },
      escape: function(txt){
        return txt
          .replace(/\n/gim,'<br/>')
          .replace(/\t/gim, '&nbsp;&nbsp;&nbsp;&nbsp;');
      },
      transformToHtml: function(txt, style){
        return fmt.format('<span class="{}" style="{}">{}</span>', style.classes.join(' '), style.style, txt);
      }
    });

    return {
      WebWriter: WebWriter
    };

  });
})();
