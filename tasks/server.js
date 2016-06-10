const gulp = require('gulp');
const connect = require('gulp-connect');

gulp.task('server', function() {
  connect.server({
    root: '.',
    livereload: true
  });
});

gulp.task('watch', function() {
  gulp.watch('css/**/*.scss', ['sass', 'html']);
  gulp.watch('js/**/*.js', ['js', 'html']);
  gulp.watch('./*.html', ['html']);
});
