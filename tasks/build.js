var gulp = require('gulp');
var symlink = require('gulp-symlink');

gulp.task('build:web', ['inject:web'], function(){

});

gulp.task('build:dev', ['clean:build', 'clean:serve-root', 'build:web'], function(){
  gulp.src('./build/web/*')
    .pipe(gulp.dest('./.serve-root/web'));
  gulp.src('./bower_components')
    .pipe(symlink('./.serve-root/web/bower_components'));
});

gulp.task('build:tests', ['clean:build', 'clean:serve-root', 'inject:tests'], function(){
  console.log('Should be injected and build under ./build/tests/index.html');
  gulp.src('./build/tests/*')
    .pipe(gulp.dest('./.serve-root/tests'));
  gulp.src('./bower_components')
    .pipe(symlink('./.serve-root/tests/bower_components'));
});


gulp.watch(['./tests/*.html', './tests/**/*.html', './tests/*.js', './tests/**/*.js'], ['build:tests']);
