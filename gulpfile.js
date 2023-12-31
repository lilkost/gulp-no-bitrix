const {src, dest, watch, parallel, series} = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    })
}
function styles() {
    return src('app/scss/style.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist:['last 10 version'], 
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}
function img() {
    return src('app/images/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/images'))
}
function cleanDist() {
    return del('dist')
}

function sripts () {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html',
    ],{base: 'app'} )
    .pipe(dest('dist'));
}


function watching() {
    watch(['app/scss/**/*.scss'], styles);
    // cледить за всеми, кроме мин js
    watch(['app/js/**/*.js', '!app/js/**/main.min.js'], sripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}



exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.sripts = sripts;
exports.cleanDist = cleanDist;
exports.img = img;

// gulp build
exports.build = series(cleanDist, img, build);
// gulp
exports.default = parallel(styles, browsersync, watching, sripts,);