// Gulp modules
const gulp = require('gulp');
const {task, series, parallel} = require('gulp');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const htmlReplace = require('gulp-html-replace');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const gulpif = require('gulp-if');
const fs = require('fs');

const manifest = require('./manifest.json');

let buildConfig = {};
if (fs.existsSync('./.conf.json')) {
    buildConfig = require('./.conf.json');
    console.info('Found .conf.json file')
}

// Node modules
const rimraf = require('rimraf');
const humanSize = require('humanize').filesize;

// Constants
const BUILD_DIR = 'build/';
const DIST_DIR = 'dist/';

// Helpers
function printCSSInfo(d) {
    let origSize = humanSize(d.stats.originalSize);
    let minSize = humanSize(d.stats.minifiedSize);
    let eff = (d.stats.efficiency * 100).toFixed(1);

    console.info(`${d.name} \n\t ${origSize} → ${minSize} [${eff}%] @ ${d.stats.timeSpent}ms`);
}

// Tasks

gulp.task('clean', cb => {
    rimraf(BUILD_DIR + '**', cb);
});

gulp.task('copy', (cb) => {
    gulp.src([
        'manifest.json',
    ])
        .pipe(gulp.dest(BUILD_DIR));
    cb();
});

gulp.task('fonts', () => {
    return gulp.src('node_modules/font-awesome/fonts/*.woff*')
        .pipe(gulp.dest(BUILD_DIR + 'fonts'));
});

gulp.task('images', () => {
    return gulp.src('imgs/**')
        .pipe(imagemin())
        .pipe(gulp.dest(BUILD_DIR + 'imgs'));
});

gulp.task('css:app', () => {
    return gulp.src('css/**')
        .pipe(cleanCSS({debug: true}, printCSSInfo))
        .pipe(gulp.dest(BUILD_DIR + 'css'));
});

gulp.task('css:vendor', () => {
    return gulp.src([
        'node_modules/jquery-jsonview/dist/jquery.jsonview.css',
        'node_modules/font-awesome/css/font-awesome.min.css'
    ])
        .pipe(cleanCSS({debug: true, rebase: false}, printCSSInfo))
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest(BUILD_DIR + 'css'));
});

gulp.task('html:replace', () => {
    return gulp.src('./*.html')
        .pipe(htmlReplace({
            'vendor-style': 'css/vendor.min.css',
            'vendor-script': 'js/vendor.min.js'
        }))
        .pipe(gulp.dest(BUILD_DIR))
});

gulp.task('js:app', () => {
    return gulp.src([
        'js/**',
        '!js/ga.js'
    ])
        .pipe(uglify())
        .pipe(gulp.dest(BUILD_DIR + 'js'));
});

gulp.task('js:ga', () => {
    const shouldReplace = buildConfig && !!buildConfig.GA_TRACKING_ID;

    return gulp.src('js/ga.js')
        .pipe(gulpif(shouldReplace, replace('UA-XXXXX-XX', buildConfig.GA_TRACKING_ID)))
        .pipe(gulp.dest(BUILD_DIR + 'js'));

});

gulp.task('js:vendor', () => {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/jquery-jsonview/dist/jquery.jsonview.js',
        'node_modules/mark.js/dist/jquery.mark.min.js'
    ])
        .pipe(uglify())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest(BUILD_DIR + 'js'));
});


gulp.task('zip', () => {
    return gulp.src(BUILD_DIR + '**')
        .pipe(zip(`dist_${manifest.version}.zip`))
        .pipe(gulp.dest(DIST_DIR))
});

module.exports.default = gulp.series(
    'clean',
    gulp.parallel('copy', 'fonts', 'images'),
    'css:app',
    'css:vendor',
    gulp.parallel('js:app','js:ga','js:vendor'),
    'html:replace',
    'zip');