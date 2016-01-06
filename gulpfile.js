var gulp = require('gulp');
var gutil = require('gulp-util');
var requireDir = require('require-dir');

var tasks = requireDir('tasks/');


gulp.task('default', function(){
  gutil.log('Primer emulator', tasks);
});
