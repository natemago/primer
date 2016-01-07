var gulp = require('gulp');
var symlink = require('gulp-symlink');

gulp.task('build:web', ['inject:web'], function(){

});

gulp.task('build:dev', ['clean:build', 'build:web'], function(){
  gulp.src('./build/*')
    .pipe(gulp.dest('./.serve-root'));
  gulp.src('./bower_components')
    .pipe(symlink('./.serve-root/bower_components'));
});
