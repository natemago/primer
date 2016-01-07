var gulp = require('gulp');

var vendorScripts = [
  'primer-di/src/core.js',
  'primer-di/src/helpers.js',
  'libdraw/libdraw.0.3.0.js'
].map(function(path){ return './bower_components/' + path;});


exports.paths = {
  vendorScripts: vendorScripts
};
