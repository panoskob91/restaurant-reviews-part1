var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var imagesConvert = require('gulp-images-convert');

//Minimise images task
//Compress images
gulp.task('image', function(){
    gulp.src('img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('compressed-images/'));

});

//Chage image format
//From .jpg to .jpeg
gulp.task('convert', function () {
    return gulp.src('img/*.jpg')
        .pipe(imagesConvert({targetType: 'jpg'}))
        .pipe(rename({extname: '.jpeg'}))
        .pipe(gulp.dest('converted-images-toJPEG/'));
  })
