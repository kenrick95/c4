'use strict';

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    inject = require('gulp-inject'),
    tsc = require('gulp-typescript'),
    tslint = require('gulp-tslint'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    del = require('del'),
    tap = require('gulp-tap'),
    Config = require('./gulpfile.config'),
    tsProject = tsc.createProject('tsconfig.json'),
    browserSync = require('browser-sync'),
    superstatic = require('superstatic'),
    browserify = require('browserify');
var buffer = require('gulp-buffer');

var config = new Config();

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
// gulp.task('gen-ts-refs', function () {
//     var target = gulp.src(config.appTypeScriptReferences);
//     var sources = gulp.src([config.allTypeScript], {read: false});
//     return target.pipe(inject(sources, {
//         starttag: '//{',
//         endtag: '//}',
//         transform: function (filepath) {
//             return '/// <reference path="../..' + filepath + '" />';
//         }
//     })).pipe(gulp.dest(config.typings));
// });

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
    return gulp.src(config.allTypeScript)
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var sourceTsFiles = [config.allTypeScript,                //path to typescript files
                         config.libraryTypeScriptDefinitions]; //reference to library .d.ts files
                        

    var tsResult = gulp.src(sourceTsFiles)
                       .pipe(sourcemaps.init())
                       .pipe(tsProject());

        tsResult.dts.pipe(gulp.dest(config.tsOutputPath));
        return tsResult.js
                        .pipe(sourcemaps.write('.'))
                        .pipe(gulp.dest(config.tsOutputPath));
});

gulp.task('bundle', ['compile-ts'], function() {
    return gulp.src('src/js/app.js', {read: false}) // no need of reading file because browserify does.

    // transform file objects using gulp-tap plugin
    .pipe(tap(function (file) {
      // replace file contents with browserify's bundle stream
      file.contents = browserify(file.path, {debug: true}).bundle();
    }))

    // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
    .pipe(buffer())

    // load and init sourcemaps
    .pipe(sourcemaps.init({loadMaps: true}))

    .pipe(uglify())

    // write sourcemaps
    .pipe(sourcemaps.write('./'))

    .pipe(gulp.dest('dest'));
});

// TODO: combine and minify into one file
gulp.task('minify', function () {
    return gulp.src(config.allJavaScript)
        .pipe(uglify())
        .pipe(gulp.dest(config.dist));
});

 
gulp.task('sass', function () {
    return gulp.src(config.allSass)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.sassOutputPath));
});
 
gulp.task('sass:watch', function () {
    gulp.watch(config.allSass, ['sass']);
});

/**
 * Remove all generated JavaScript files from TypeScript compilation.
 */
gulp.task('clean-ts', function (cb) {
  var typeScriptGenFiles = [
                              config.tsOutputPath +'/**/*.js',    // path to all JS files auto gen'd by editor
                              config.tsOutputPath +'/**/*.js.map', // path to all sourcemap files auto gen'd by editor
                              '!' + config.tsOutputPath + '/lib'
                           ];

  // delete the files
  del(typeScriptGenFiles, cb);
});

gulp.task('watch', function() {
    gulp.watch([config.allTypeScript], ['ts-lint', 'compile-ts']);
});

gulp.task('serve', ['compile-ts', 'watch'], function() {
  process.stdout.write('Starting browserSync and superstatic...\n');
  browserSync({
    port: 3000,
    files: ['index.html', '**/*.js'],
    injectChanges: true,
    logFileChanges: false,
    logLevel: 'silent',
    logPrefix: 'txl',
    notify: true,
    reloadDelay: 0,
    server: {
      baseDir: './src',
      middleware: superstatic({ debug: false})
    }
  });
});

gulp.task('default', ['ts-lint', 'compile-ts']);