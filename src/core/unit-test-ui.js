def('unit:ui', 
['jQuery', 'libDraw'], 
function($, libDraw){

    var DEFAULT_RULES = {
        ".unit-tests-log": [
            "font-family: monospace;",
            "font-size: 10px;",
            "padding: 5px;"
        ].join('')
    };

    var TestsLog = function(config){
        libDraw.ext(this, config);
        this.el = $([].join('<div class="unit-tests-log"></div>'))[0];
        libDraw.each(this.cssRules, function(ruleBody, rule){
             $("<style>")
                .prop("type", "text/css")
                .html([
                    rule, '{',
                    body,
                    '}'
                ].join(''))
                .appendTo("head");
        }, this);
        $(document.body).append(this.el);
    };
    
    libDraw.ext(TestsLog, {
        write: function(message, extraClass, extraStyle){
            $(this.el).append('<span class="tests-log-output '+
                (extraClass || '' )+'" style="'+(extraStyle||'')+'">' + message 
                + '</span>'); 
        },
        writeLn: function(message, extraClass, extraStyle){
            $(this.el).append('<div class="tests-log-output tests-log-line'+
                (extraClass || '' )+'" style="'+(extraStyle||'')+'">' + message 
                + '</div>');
        }
    });
    

    return {
        TestsLog: TestsLog
    };
    
    var __testsLogWriter = new TestsLog({});
    def('unit:core:log-writer', [], function(){
        return __testsLogWriter;
    });
    
});
