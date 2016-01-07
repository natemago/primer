var gulp = require('gulp');
var serve = require('gulp-serve');

gulp.task('serve', ['build:dev'], serve({
  root: ['./.serve-root/web', '.'],
  port: 4000,
  hostname: 'localhost'
}));

gulp.task('serve:test', ['build:tests'], serve({
  root: ['./.serve-root/tests', '.'],
  port: 4000,
  hostname: 'localhost'
}));
