(function(){
  def('ui.components.tests', ['unit:test:suite', '$'], function(suite, $){
    suite('UI POCs', function(testcase){
      testcase('HTML Template tag', function(ok, log, assert){
        var templateMarkup = [
          '<template id="test-template">',
            '<div class="in-template"></div>',
          '</template>'
        ].join('');

        var templateEl = $(templateMarkup)[0];
        document.body.appendChild(templateEl);

        ok($('#test-template').length == 1);

        

      });
    }, function(){
      // before


    });
  });
})();
