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
var uglify = require('gulp-uglify');
var beep = require('beepbeep');
var del = require('del');
var browserSync = require('browser-sync').create();
var notifier = require('node-notifier');


/* Variables */
var development = environments.development;
var production = environments.production;

var jsFiles = [
    './public/**/*.js',
    './public/**/services/*.js',
    './public/**/directives/*.js',
    './public/**/controllers/*.js',
    './public/**/library/js/*.js'
];
var cssFiles = './public/**/*.css';
var imgFiles = './public/**/*.+(png|svg|jpg|jpeg|ico)';
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
gulp.task('browserSync', function(){
    browserSync.init({
        proxy: 'localhost:8080',
        port: 9090,
        notify: true
    });
});

gulp.task('js', function(){
    return gulp.src(jsFiles)
        .pipe(plumber({
            errorHandler: errorHandling
        }))
        .pipe(cache('jsFiles'))
        .pipe(ngAnnotate())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(production(uglify(uglifyOptions)))
        .pipe(production(concat('resources/js/all.min.js')))
        .pipe(plumber.stop())
        .pipe(gulp.dest("www/"))
        .pipe(development(browserSync.reload({stream: true})));
});

gulp.task('img', function(){
    return gulp.src(imgFiles)
        .pipe(cache('cssFiles'))
        .pipe(gulp.dest("www/"));
});

gulp.task('css', function(){
    return gulp.src(cssFiles)
        .pipe(plumber({
            errorHandler: errorHandling
        }))
        .pipe(cache('imgFiles'))
        // .pipe(production(concatCss('resources/css/all.min.css'))) TODO
        .pipe(production(cssnano()))
        .pipe(plumber.stop())
        .pipe(gulp.dest("www/"))
        .pipe(development(browserSync.reload({stream: true})));
});

gulp.task('watch', ['js', 'css', 'img'],function(){
    gulp.watch(cssFiles, ['css']);
    gulp.watch(jsFiles, ['js']);
    gulp.watch(imgFiles, ['img']);
})

gulp.task('start', ['js', 'css', 'img'], function(cb){
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
            cb();
        }
    }).on('restart', function(){
        setTimeout(function(){
            browserSync.reload({stream: false});
        }, 1000);
    });
});

gulp.task('www-error', function(){
    gulp.watch('www/**/*', function(){
        notifier.notify({
            title: 'WWW folder contents has been modified',
            message: 'Files inside www/ folder have been modified, please apply changes to public/ folder contents'
          });
        beep(3, 1000);
    });
});

gulp.task('clean:www', function(){
    return del.sync('www');
})

gulp.task('default', function(cb){
    var tasks = ['js', 'img', 'css'];
    if (gutil.env.env == "production"){
        environments.current(production);
    } else {
        environments.current(development);
        tasks.push('start', 'watch', 'browserSync');
    }

    return gulpSequence('clean:www', tasks)(cb);
});