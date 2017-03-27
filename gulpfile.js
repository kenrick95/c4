'use strict'
var gulp = require('gulp')
// var debug = require('gulp-debug')
// var inject = require('gulp-inject')
var tsc = require('gulp-typescript')
var tslint = require('gulp-tslint')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')
var del = require('del')
var tap = require('gulp-tap')
var Config = require('./gulpfile.config')
var tsProject = tsc.createProject('tsconfig.json')
var browserSync = require('browser-sync')
var superstatic = require('superstatic')
var browserify = require('browserify')

var buffer = require('gulp-buffer')

var config = new Config()

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
  return gulp.src(config.allTypeScript)
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .pipe(tslint.report())
})

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
  var sourceTsFiles = [config.allTypeScript, // path to typescript files
    config.libraryTypeScriptDefinitions] // reference to library .d.ts files

  var tsResult = gulp.src(sourceTsFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProject())

  tsResult.dts.pipe(gulp.dest(config.tsOutputPath))
  return tsResult.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.tsOutputPath))
})

var bundleFile = function (mainFilePath) {
  return gulp.src(mainFilePath, { read: false }) // no need of reading file because browserify does.

    // transform file objects using gulp-tap plugin
    .pipe(tap(function (file) {
      // replace file contents with browserify's bundle stream
      file.contents = browserify(file.path, { debug: true }).bundle()
    }))

    // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
    .pipe(buffer())

    // load and init sourcemaps
    .pipe(sourcemaps.init({ loadMaps: true }))

    .pipe(uglify())

    // write sourcemaps
    .pipe(sourcemaps.write('./'))

    .pipe(gulp.dest('dist'))
}
gulp.task('bundle-only-main', function () {
  return bundleFile(config.tsOutputPath + '/app.js')
})
gulp.task('bundle-only-client', function () {
  return bundleFile(config.tsOutputPath + '/app-flyweb-client.js')
})
gulp.task('bundle', ['compile-ts'], function () {
  return gulp.start('bundle-only-main', 'bundle-only-client')
})

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
  var typeScriptGenFiles = [
    config.tsOutputPath + '/**/*.js',    // path to all JS files auto gen'd by editor
    config.tsOutputPath + '/**/*.js.map', // path to all sourcemap files auto gen'd by editor
    '!' + config.tsOutputPath + '/lib'
  ]

  // delete the files
  del(typeScriptGenFiles, cb)
})

gulp.task('watch', function () {
  gulp.watch([config.allTypeScript], ['ts-lint', 'bundle'])
})

gulp.task('serve', ['bundle', 'watch'], function () {
  process.stdout.write('Starting browserSync and superstatic...\n')
  browserSync({
    port: 3000,
    files: ['index.html', '**/*.js'],
    injectChanges: true,
    logFileChanges: false,
    logLevel: 'silent',
    logPrefix: 'c4',
    notify: true,
    reloadDelay: 0,
    server: {
      baseDir: './src',
      middleware: superstatic({ debug: false })
    }
  })
})

gulp.task('default', ['ts-lint', 'bundle'])
