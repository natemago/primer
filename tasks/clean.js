var gulp = require('gulp');
var rmrf = require('rimraf');

gulp.task('clean:build', function(){

});

gulp.task('clean:dist', function(){

});

gulp.task('clean:serve-root', function(cb){
  rmrf('./.serve-root', cb);
})

gulp.task('clean', ['clean:build', 'clean:dist', 'clean:serve-root'], function(){

});
