require('require-dir')('./gulp');

var gulp = require("gulp");
var nodemon = require('gulp-nodemon');
var ngAnnotate = require('gulp-ng-annotate');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var gulpSequence = require('gulp-sequence');
var cache = require('gulp-cached');
var environments = require('gulp-environments');
var gutil = require('gulp-util');
var cssnano = require('gulp-cssnano');
var concatCss = require('gulp-concat-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var gulpFn  = require('gulp-fn');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var beep = require('beepbeep');
var del = require('del');
var browserSync = require('browser-sync').create();
var notifier = require('node-notifier');
var log = require('fancy-log');
var fs = require('fs');


/* Variables */
var development = environments.development;
var production = environments.production;
var wwwChangedViaGulp = false;

var jsFiles = [
    './public/**/*.js',
    './public/**/services/*.js',
    './public/**/directives/*.js',
    './public/**/controllers/*.js',
    './public/**/library/js/*.js'
];
var cssFiles = './public/resources/css/*.scss';
var cssFilesToWatch = './public/**/*.scss';
var imgFiles = './public/**/*.+(png|svg|jpg|jpeg|ico)';
var miscFiles = [
    './public/*.*',
    './public/**/templates/*.html',
    './public/sitemap/**/*.xml'
]

var nodeFiles = [
    './models/**/*',
    './api_controllers/**/*',
    './view_controllers/**/*'
]

var uglifyOptions = {
    output: {
        comments: false
    },
    compress:{
        collapse_vars: false,
        conditionals: false
    }
};

/* Helper methods */
function errorHandling(err){    
    notify.onError({
        title: 'Gulp error: ' + err.plugin,
        message: err.toString()
    })(err);
    beep(3);
    this.emit('end');
}

/* Gulp tasks */
gulp.task('compile', function(cb){
    if(fs.existsSync('www/resources/images')){
        return gulpSequence('clean:saveimages', ['js', 'css', 'misc'])(cb);
    } else {
        return gulpSequence('clean:saveimages', ['js', 'css', 'misc', 'img'])(cb);
    }
});

gulp.task('compile-production', function(cb){
    return gulpSequence('clean:www', ['js', 'css', 'img', 'misc'])(cb);
});

gulp.task('browserSync', function(){
    browserSync.init({
        proxy: 'localhost:8080',
        port: 9090,
        notify: true
    });
});

gulp.task('js', function(){
    return gulp.src(jsFiles)
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = true;
        }))
        .pipe(plumber({
            errorHandler: errorHandling
        }))
        .pipe(cache('jsFiles'))
        .pipe(ngAnnotate())
        .pipe(jshint({
            sub: true,
            esversion: 6
        }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(production(uglify(uglifyOptions)))
        .pipe(production(concat('resources/js/all.min.js')))
        .pipe(plumber.stop())
        .pipe(gulp.dest("www/"))
        .pipe(development(browserSync.reload({stream: true})))
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = false;
        }));
});

gulp.task('scan:nodejs', function(){
    return gulp.src(nodeFiles)
        .pipe(plumber({
            errorHandler: errorHandling
        }))
        .pipe(jshint({
            sub: true,
            esversion: 6
        }))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(plumber.stop());
});

gulp.task('img', function(){
    return gulp.src(imgFiles)
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = true;
        }))
        .pipe(cache('imgFiles'))
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
        .pipe(gulp.dest("www/"))
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = false;
        }));
});

gulp.task('misc', function(){
    return gulp.src(miscFiles, {base: "./public"})
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = true;
        }))
        .pipe(gulp.dest("www/"))
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = false;
        }));
});

gulp.task('css', function(){
    return gulp.src(cssFilesToWatch)
        .pipe(plumber({
            errorHandler: errorHandling
        }))
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = true;
        }))
        // .pipe(cache('cssFiles'))
        .pipe(sass({
            includePaths: [
                './public/resources/css/base',
                './public/resources/css/default',
                './public/resources/css/styles'
            ]
        }).on('erorr', sass.logError))
        // .pipe(production(concatCss('resources/css/all.min.css'))) TODO
        // .pipe(production(cssnano({
        //     "zindex": false
        // })))
        .pipe(plumber.stop())
        .pipe(gulp.dest("www/"))
        .pipe(development(browserSync.reload({stream: true})))
        .pipe(gulpFn(function(file){
            wwwChangedViaGulp = false;
        }));
});

gulp.task('watch', function(){
    gulp.watch(cssFilesToWatch, {interval: 1000}, ['css']);
    gulp.watch(jsFiles, {interval: 1000}, ['js']);
    gulp.watch(miscFiles, {interval: 1000}, ['misc']);
})

gulp.task('start', function(cb){
    var called = false;
    return nodemon({
        script: 'server.js',
        ignore: [
            'public/**/*.*',
            'www/**/*.*'
        ]
    }).on('start', function(){
        if (!called){
            called = true;
            setTimeout(cb, 5000); // wait for nodemon to fire 'node server.js'
        }
    }).on('restart', function(){
        setTimeout(function(){
            browserSync.reload({stream: false});
        }, 1000);
    });
});

gulp.task('www-error', function(){
    // gulp.watch('www/**/*', function(){
    //     if (!wwwChangedViaGulp){
    //         notifier.notify({
    //             title: 'WWW folder contents has been modified',
    //             message: 'Files inside www/ folder have been modified, please apply changes to public/ folder contents'
    //         });
    //         beep(3, 1000);
    //     }
    // });
});

gulp.task('clean:saveimages', function(){
    return del.sync(['www/resources/*', 'www/*', '!www/resources', '!www/resources/images/**']);
});

gulp.task('clean:www', function(){
    return del.sync('www');
});

gulp.task('run', function(cb){
    if (gutil.env.env == "production"){
        environments.current(production);
        return gulpSequence('compile-production')(cb);
    } else {
        environments.current(development);
        return gulpSequence('compile', 'start', 'watch', 'browserSync', 'www-error')(cb);
    }    
});

gulp.task('default', function(){
    var gulpTasksList = `\n
(to run tasks use 'gulp <task>')
    TASKS                  DESCRIPTION

    run                     |  for front-end development (copies files to www folder, starts nodemon, browserSync, www-error watch)
    
    compile-production      |  cleans www folder then copies files to that folder (js, css, img)

    compile                 |  runs clean:saveimages then copies files to that folder (js, css, img). NOTE: it will not copy images if www/resources/images folder exists
    
    clean:www               |  deletes www folder
    
    clean:saveimages        |  deletes www folder, except www/resouces/images/
    
    js                      |  copy js files to www folder
    
    css                     |  copy css files to www folder
    
    img                     |  copy img files to www folder
    
    misc                    |  copy files inside public folder (doesn't include subfolders)

    scan:nodejs             |  scan nodeJS files with jshint


    test-views              |  run test for views
    
    test-db                 |  run test for db
    
    test-e2e                |  run test for end to end testing
    
    g
    run --env production    | compiles everything for production environment\n`;

    log(gulpTasksList);
});