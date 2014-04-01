def('unit:ui', 
['jQuery', 'libDraw'], 
function($, libDraw){

    var DEFAULT_RULES = {
        ".unit-tests-log": [
            "font-family: monospace;",
            "font-size: 10px;",
            "padding: 5px;"
        ].join(''),
        ".out-error": "color: #AA0000;",
        ".out-warn": "color: #AAAA00;",
        ".out-debug": "color: #999;",
        ".out-trace": "color: #AAA;",
        ".out-success": "color: #0A0;"
    };

    var TestsLog = function(config){
        libDraw.ext(this, config);
        this.el = $(['<div class="unit-tests-log"></div>'].join(''))[0];
        var self = this;
        this.cssRules = {};
        libDraw.ext(this.cssRules, DEFAULT_RULES);
        libDraw.ext(this.cssRules, config.cssRules || {});
        $(document).ready(function(){
            var rules = [];
            libDraw.each(self.cssRules, function(ruleBody, rule){
                 rules.push([
                    rule, '{',
                    ruleBody,
                    '}'
                ].join(''));
            }, self);
            $("<style>")
                .prop("type", "text/css")
                .html(rules.join(''))
                .appendTo("head");
            $(document.body).append(self.el);
        });
    };
    
    libDraw.ext(TestsLog, {
        write: function(message, extraClass, extraStyle){
            $(this.el).append('<span class="tests-log-output '+
                (extraClass || '' )+'" style="'+(extraStyle||'')+'">' + this.toHTML(message) 
                + '</span>'); 
        },
        writeLn: function(message, extraClass, extraStyle){
            $(this.el).append('<div class="tests-log-output tests-log-line '+
                (extraClass || '' )+'" style="'+(extraStyle||'')+'">' + this.toHTML(message) 
                + '</div>');
        },
        toHTML: function(str){
            return str.replace(/\n/gm, '<br />').replace(/\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    });
    
    
    var __testsLogWriter = new TestsLog({});
    def('unit:core:log-writer', [], function(){
        return __testsLogWriter;
    });
    
    return {
        TestsLog: TestsLog
    };
    
});
