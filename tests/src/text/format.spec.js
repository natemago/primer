(function(){
  def('text.format.tests',['unit:test:suite', 'text.format'], function(suite, txtf){
    suite('Research tests','', function(usecase){
      usecase('Research directive regex', '', function(ok, log, expect){
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

    suite('Lexer', 'Text format lexer', function(usecase){
      usecase('Parse tokens - single command, start of line', 'Parse tokens', function(ok, log, expect){
        var txt = '{color:green} rest of line.';
        var lexer = new txtf.Lexer(txt);

        var token = lexer.nextToken();
        ok(token);
        ok(token.command);
        ok(!token.text);
        expect(token.command, 'color:green');

        token = lexer.nextToken();
        ok(token);
        ok(!token.command);
        ok(token.text);
        expect(token.text, ' rest of line.');

        token = lexer.nextToken();
        ok(!token);
        log.info('Token is none -> [', token, ']');
      });

      usecase('Parse tokens - single command, middle of line', 'Parse tokens', function(ok, log, expect){
        var txt = 'start of line {color:green} rest of line.';
        var lexer = new txtf.Lexer(txt);

        var token = lexer.nextToken();
        ok(token);
        ok(token.command);
        ok(token.text);
        expect(token.command, 'color:green');
        expect(token.text, 'start of line ');

        token = lexer.nextToken();
        ok(token);
        ok(!token.command);
        ok(token.text);
        expect(token.text, ' rest of line.');

        token = lexer.nextToken();
        ok(!token);
        log.info('Token is none -> [', token, ']');
      });

      usecase('Parse tokens - single command, end of line', 'Parse tokens', function(ok, log, expect){
        var txt = 'start of line {color:green}';
        var lexer = new txtf.Lexer(txt);


        var token = lexer.nextToken();
        ok(token);
        ok(token.command);
        ok(token.text);
        expect(token.command, 'color:green');
        expect(token.text, 'start of line ');

        token = lexer.nextToken();
        ok(!token);
        log.info('Token is none -> [', token, ']');
      });
    });
  });
})();
