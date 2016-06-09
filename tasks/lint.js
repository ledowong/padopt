const {eslint} = require('gulp-load-plugins')();
const gulp = require('gulp');
const globs = ['gulpfile.js', 'tasks/**/*.js', 'js/**/*.js'];

gulp.task('lint', function() {
  return gulp.src(globs)
  .pipe(eslint({}))
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});
