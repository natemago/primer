(function(){
  def('text.format.tests',['unit:test:suite', 'text.format', 'utils:each'], function(suite, txtf, each){
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
        ok(!token.command);
        ok(token.text);
        expect(token.text, 'start of line ');

        token = lexer.nextToken();
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

      usecase('Parse tokens - single command, end of line', 'Parse tokens', function(ok, log, expect){
        var txt = 'start of line {color:green}';
        var lexer = new txtf.Lexer(txt);


        var token = lexer.nextToken();
        ok(token);
        ok(!token.command);
        ok(token.text);
        expect(token.text, 'start of line ');

        token = lexer.nextToken();
        ok(token);
        ok(token.command);
        ok(!token.text);
        expect(token.command, 'color:green');

        token = lexer.nextToken();
        ok(!token);
        log.info('Token is none -> [', token, ']');
      });

      usecase('Parse tokens - multiple commands', 'Parse tokens', function(ok, log, expect){
        var txt = 'This is {color:red} some {style:bold}red bold{/style} text{/color} without color.';
        var lexer = new txtf.Lexer(txt);

        var token = lexer.nextToken();
        ok(token);
        ok(token.text);
        ok(!token.command);
        expect(token.text, 'This is ');

        token = lexer.nextToken();
        ok(token);
        ok(!token.text);
        ok(token.command);
        expect(token.command, 'color:red');

        token = lexer.nextToken();
        ok(token);
        ok(token.text);
        ok(!token.command);
        expect(token.text, ' some ');

        token = lexer.nextToken();
        ok(token);
        ok(!token.text);
        ok(token.command);
        expect(token.command, 'style:bold');

        token = lexer.nextToken();
        ok(token);
        ok(token.text);
        ok(!token.command);
        expect(token.text, 'red bold');

        token = lexer.nextToken();
        ok(token);
        ok(!token.text);
        ok(token.command);
        expect(token.command, '/style');

        token = lexer.nextToken();
        ok(token);
        ok(token.text);
        ok(!token.command);
        expect(token.text, ' text');

        token = lexer.nextToken();
        ok(token);
        ok(!token.text);
        ok(token.command);
        expect(token.command, '/color');

        token = lexer.nextToken();
        ok(token);
        ok(token.text);
        ok(!token.command);
        expect(token.text, ' without color.');
      });
    });

    suite('Parser', 'Text format parser', function(usecase){
      usecase('Parse text into standard format', 'Parse text to standard format', function(ok, log, expect){
        var expectObj = function(obj, expected, inObject){
          ok(obj !== null && expected !== null, 'Expected non null object');
          ok(obj !== undefined && expected !== undefined, 'Expected a defined object');
          each(obj, function(val, prop){
            if(typeof(val) == 'object'){
              expectObj(val, expected[prop] || {}, (inObject ? (inObject + '.' + prop) : prop ));
            }else{
              expect(val, expected[prop], 'For property ['+prop+']' + (inObject ? (' in object ' + inObject) : '') + '.');
            }
          });
        };
        var txt = 'This is {color:red} some {style:bold}red bold{/style} text{/color} without color.';
        var parser = new txtf.Parser();
        var result = parser.parseText(txt);
        console.log(result);

        ok(result);
        expect(result.length, 5, 'Number of tokens');

        expectObj({
          text: 'This is ',
          format: {}
        }, result[0]);
        expectObj({
          text: ' some ',
          format: {
            color: 'red'
          }
        }, result[1]);
        expectObj({
          text: 'red bold',
          format: {
            color: 'red',
            style: 'bold'
          }
        }, result[2]);

        expectObj({
          text: ' text',
          format: {
            color: 'red'
          }
        }, result[3]);

        expectObj({
          text: ' without color.'
        }, result[4]);
      });
    });

    suite('Text format', 'format', function(usecase){
      usecase('Format text', 'format text', function(ok, log, expect){
        var result = txtf.format('This {} is some {} {}', 'text', 'formatted', 'string');
        expect('This text is some formatted string', result);
        log.info('Format result: ', result);
      });

      usecase('Start with format', '', function(ok, log, expect){
        var result = txtf.format('{} World!', 'Hello');
        expect('Hello World!', result);
      });

      usecase('End on format', '', function(ok, log, expect){
        var result = txtf.format('Hello {}', 'World!');
        expect('Hello World!', result);
      });

      usecase('Format in the middle', '', function(ok, log, expect){
        var result = txtf.format('Middle {} text', 'format');
        expect('Middle format text', result);
      });

      usecase('Missing argument', '', function(ok, log, expect){
        var result = txtf.format('This is {}, but this [{}] is not.', 'replaced');
        expect('This is replaced, but this [] is not.', result);
      });
    });
  });
})();
