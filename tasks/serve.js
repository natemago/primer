var gulp = require('gulp');
var serve = require('gulp-serve');

gulp.task('serve', ['build:dev'], serve({
  root: ['./.serve-root', '.'],
  port: 4000,
  hostname: 'localhost'
}));
