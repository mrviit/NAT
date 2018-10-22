var browserify = require("browserify");
var del = require('del');
var exec = require('child_process').exec;
var glob = require('glob');
var gulp = require('gulp');
var buffer = require('gulp-buffer');  //require('vinyl-buffer');
// var cssnano = require('gulp-cssnano');
var expect = require('gulp-expect-file');
var gulpIf = require('gulp-if');
var log = require('gulplog');
var rename = require('gulp-rename');
// var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var tap = require('gulp-tap');
var ts = require('gulp-typescript');
// var uglify = require('gulp-uglify');
var uglify = require('gulp-uglify-es').default;
var util = require('gulp-util');
var merge = require('merge-stream');
const path = require('path');
var reactify = require('reactify');
var runSequence = require('run-sequence');
var tsify = require("tsify");
var source = require('vinyl-source-stream');

// config files

var tsProject = ts.createProject('./tsconfig.json');
var config = require('./gulp_config.json');

// environments

var env;

function getEnv() {
  if (env != null) {
    return;
  }

  var envKeys = Object.keys(config);
  if (envKeys.length == 0) {
    util.log('No environments found in config.json');
    process.exit(1);
  }

  var envKey = envKeys[0];
  if (typeof util.env.env == 'string') {
    if (envKeys.indexOf(util.env.env) == -1) {
      util.log('Environment \'' + util.env.env + '\' does not exist in config.json');
      process.exit(1);
    }
    envKey = util.env.env;
  }

  env = config[envKey];
  util.log('Using environment \'' + envKey + '\'');
}

// tasks

gulp.task('ts', function () {
  getEnv();

  return tsProject.src()
    .pipe(gulpIf(env.typescript.sourceMaps.use, sourcemaps.init()))
    .pipe(tsProject())
    .pipe(gulpIf(env.typescript.minify, uglify()))
    //.pipe(rename({extname: env.typescript.outExt}))
    .pipe(gulpIf(env.typescript.sourceMaps.use,
      sourcemaps.write(env.typescript.sourceMaps.external ?
        env.typescript.sourceMaps.externalRelDir : null,
        env.typescript.sourceMaps.external ? {
          sourceMappingURLPrefix: env.typescript.sourceMaps.externalURLPrefix,
          includeContent: false,
          sourceRoot: env.typescript.sourceMaps.sourceRoot
        } : null
      )))
    .pipe(gulp.dest(env.typescript.outDir))
    ;
});

// gulp.task('sass', function() {
//   getEnv();

//   return gulp.src(env.sass.src)
//     .pipe(gulpIf(env.sass.sourceMaps.use, sourcemaps.init()))
//     .pipe(sass().on('error', sass.logError))
//     .pipe(gulpIf(env.sass.minify, cssnano()))
//     .pipe(rename({extname: env.sass.outExt}))
//     .pipe(gulpIf(env.sass.sourceMaps.use, sourcemaps.write(
//       env.sass.sourceMaps.external ? env.sass.sourceMaps.externalRelDir : null,
//       env.sass.sourceMaps.external ? {
//         sourceMappingURLPrefix: env.sass.sourceMaps.externalURLPrefix
//       } : null
//     )))
//     .pipe(gulp.dest(env.sass.outDir));
// });

gulp.task('assets', function () {
  getEnv();

  var tasks = env.assets.map(function (assets) {
    return gulp.src(assets.src)
      .pipe(expect(assets.src))
      .pipe(gulp.dest(assets.outDir));
  });

  return merge(tasks);
});

gulp.task('clean', function () {
  getEnv();

  return del(["dist/*"]);
});

gulp.task('build', function (callback) {
  getEnv();

  runSequence(
    'clean',
    'ts',
    //'sass',
    'assets',
    'browserify',
    callback
  );
});

gulp.task('watch', function (callback) {
  getEnv();

  runSequence(
    //['ts', 'sass'],
    ['ts', 'assets'],
    callback
  );

  env.assets.map((asset) => {
    gulp.watch(asset.src, ['assets']);
  });
  gulp.watch(env.typescript.src, ['ts']);
  //gulp.watch(env.sass.src, ['sass']);
});

gulp.task('help', function () {
  util.log(`
Usage: gulp [TASK] [--env ENVIRONMENT]
Tasks:
    build     Clean files, compile TypeScript and Sass and copy assets
    watch     Watch and recompile TypeScript and Sass
    ts        Compile TypeScript
    sass      Compile Sass
    assets    Copy assets
    clean     Clean files
  `);
});

gulp.task('browserify', ['ts'],  function () {

  // var files = glob.sync(`${env.typescript.outDir}/**/*.js`);
  // return merge(
  //   files.map(function(file) {
  //   return browserify({
  //       entries: file,
  //       debug: true
  //   }).transform(reactify)
  //       .bundle()
  //       .pipe(source(file))
  //       .pipe(gulp.dest("dist"))
  // })
  // );

  /////////////

  gulp.src([
    `./dist/**/*.js`
    // , `./dist/**/*.js`
    , '!./dist/mapjs/**/*.js'
    , '!./dist/services/**/*.js'
    // , '!./dist/panel/**/*.js'
    // , '!./dist/content/**/*.js'
    // , '!./dist/ga/**/*.js'
    // , '!./dist/devtools/**/*.js'
    // , '!./dist/background/**/*.js'
    , '!**/models/**/*.js'
  ]
    , { read: false, base: env.typescript.outDir })
    // .pipe(buffer())
    .pipe(tap(function (file) {
      log.info('browserifying ' + file.path);
      // exec(`browserify ${file.path} -o ${file.path}`,
      //   function (err, stdout, stderr) {
      //     log.info(stdout);
      //     log.info(stderr);
      //   });

      browserify({ 
        entries: [file.path], 
        debug: true, 
        // require: ['POMSavedToolsModel'] 
      })
      // .transform("babelify", {extensions: [".babel"]});
        // .transform("babelify", { presets: ["@babel/preset-env", "@babel/preset-react"] })
        // .external(externalDependencies)
        .bundle()
        .pipe(source(file.path))
        // .pipe(uglify({outSourceMap: true}))
        .pipe(gulp.dest('.'));

      // file.contents = browserify(file.path, {debug: true}).bundle();
    })
    )

    // .pipe(buffer())
    // .pipe(uglify())
    // // .pipe(gulp.dest('.'))

    // // .pipe(browserify()).bundle()
    // // .pipe(uglify())
    // .pipe(gulp.dest('.'))
    ;
});

gulp.task("buildTS", function () {
  gulp.src([
    `src/**/*.ts`
    // , '!./content/**/*.ts'
    // , '!./ga/**/*.js'
    // , '!./devtools/**/*.ts'
    // , '!./background/**/*.ts'
    // , '!.//models/**/*.ts'
  ],
    { base: 'src' })
    .pipe(tap(function (file) {
      log.info('bulding ' + file.path);
      browserify({
        compilerOptions: {
          module: "commonjs",
          target: "es5",
        },
        entries: file.path
      })
        .plugin(tsify)
        .bundle()
        // .pipe(expect(file.path))
        .pipe(source(file.path))
        // .pipe(source(file.path.replace("src", "dist")))
        // .pipe(gulp.dest('.'))
        .pipe(gulp.dest('dist'))
        ;
    }))
});

gulp.task('default', ['build']);