var gulp = require('gulp');
var tsc = require('gulp-typescript');
var lint = require('gulp-tslint');
var notify = require('gulp-notify');
var nodemon = require('gulp-nodemon');
var del = require('del');

var tsProject = tsc.createProject('tsconfig.json');
var config = require('./gulp.config')();

/**
 * Compile Typescript files
 */
gulp.task('compile-ts', ['cleanJs'], () => {

  var tsResult = gulp
    .src(config.srcTS)
    .pipe(lint())
    .pipe(lint.report())
    .pipe(tsProject());

    return tsResult.js
      .pipe(gulp.dest(config.destTS));
})

/**
 * Delete dest javascript directory
 */
gulp.task('cleanJs', () => {
  del([config.destTS]);
})

/**
 * Nodemon start
 */
gulp.task('serve', ['compile-ts'], () => {

  var stream = nodemon({
    script: './dest/bin',
    ext: 'ts',
    watch: ['src'],
    tasks: ['compile-ts'],
    ignore: [
      'gulpfile.js',
      'node_modules/',
      'dest/',
      'logs/'
    ]
  })
  .on('start', () => {
    console.log('Nodemon starting');
  })
  .on('restart', () => {
    console.log('Nodemon restarting');
  })
 
  return stream;
})


/**
 * Default task
 */
gulp.task('default', ['serve']);