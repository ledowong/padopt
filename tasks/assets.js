const gulp = require('gulp');
const connect = require('gulp-connect');
const cssmin = require('gulp-cssmin');
const del = require('del');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const paths = {
    javascript: [
        'js/bootstrap/polyfill.js',
        'js/bootstrap/modal.js',
        'js/bootstrap/dropdown.js',
        'js/bootstrap/tooltip.js',
        'js/orbs_data.js',
        'js/bootstrap/button.js',
        'js/optimizer2.js',
        'js/board.js',
        'js/image-analysis.js',
        'js/profile.js',
        'js/source.js'
    ],
    sass: ['css/source.scss'],
    html: ['index.html']
};

gulp.task('javascript', function () {
    gulp.src(paths.javascript)
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min', basename: 'dist'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min', basename: 'dist'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(connect.reload());
});

gulp.task('clean', function () {
    del(['dist/']);
});
