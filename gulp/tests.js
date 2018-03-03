var protractor = require('gulp-protractor').protractor;
var gulp = require("gulp");
var mocha = require('gulp-mocha');


gulp.task('test-views', ['compile', 'start'], function(){
    var stream = gulp.src("./tests/view/*.test.js", {watch: false})
            .pipe(mocha({
                reporter: "spec",
            }));
            //TODO: nodemon doesn't exit with gulp-exit() in here
    return stream;
});

gulp.task('test-db', function(){
    var stream = gulp.src("./tests/db/*.test.js", {watch: false})
            .pipe(mocha({
                reporter: "spec",
                exit: true
            }));
    return stream;
});

gulp.task('test-e2e', function(){
    return gulp.src("./tests/frontend/e2e/**/*.test.js", {watch: false})
            .pipe(protractor({
                configFile: 'protractor-conf.js'
            }))
            .on('error', function(e){ throw e; });
});