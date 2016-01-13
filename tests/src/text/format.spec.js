(function(){
  def('text.format.tests',['unit:test:suite'], function(suite){
    suite('Research tests','', function(usecase){
      usecase('Research regex', '', function(ok, log, expect){
        var sampleFormattedText = 'Th{}is}{ is {color:red}red text{/color} { ssss{}s';
        var directiveRegex = /\{[^\{\}]+\}/gm;
        var res = directiveRegex.exec(sampleFormattedText);
        ok(res);
        ok(res.length);
        expect(res[0], '{color:red}');

        res = directiveRegex.exec(sampleFormattedText);
        ok(res);
        ok(res.length);
        expect(res[0], '{/color}');
      });
    });
  });
})();
