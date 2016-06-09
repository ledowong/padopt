const gulp = require('gulp');
const runSequence = require('run-sequence').use(gulp);

gulp.task('default', function() { runSequence('clean', 'sass', 'javascript', 'server', 'watch') } );

