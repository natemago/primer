var gulp = require('gulp');

gulp.task('build:web', ['inject:web'], function(){

});

gulp.task('build:dev', ['clean:build', 'build:web'], function(){

});
