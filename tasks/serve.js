var gulp = require('gulp');
var serve = require('gulp-serve');

gulp.task('serve', serve({
  root: ['build', '.'],
  port: 4000,
  hostname: 'localhost'
}));
