var gulp = require('gulp');
var inject = require('gulp-inject');
var paths = require('./paths.js').paths;
var gutil = require('gulp-util');
var bowerFiles = require('main-bower-files');

gulp.task('inject:web', ['sass'], function(){
  gulp.src(['./web/*.html', './web/**/*.html'])
    // inject bower main files (if exposed)
    .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
    // inject vendor lib files
    .pipe(inject(gulp.src(paths.vendorScripts, {read: false}), {name: 'vendor-libs'}))
    // inject CSS files
    .pipe(inject(gulp.src(['./css/*.css', './css/**/*.css'], {read: false})))
    // inject all app scripts
    // FIXME: inject based on profile
    .pipe(inject(gulp.src(['./src/**/*.js', './src/*.js'], {read: false})))
    .pipe(gulp.dest('./build/web'));
});
