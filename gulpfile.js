const gulp = require('gulp');
const gulpif = require('gulp-if');
const composer = require('gulp-uglify/composer');
const mergeStream = require('merge-stream');
const uglifyjs = require('uglify-es');
const uglify = composer(uglifyjs, console);

const polymerBuild = require('polymer-build');
const polymerJson = require('./polymer.json');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);

const sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
const dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();

function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function build() {
  return new Promise((resolve, reject) => {

    const sourcesStream = polymerProject.sources()
      .pipe(sourcesStreamSplitter.split())
      .pipe(sourcesStreamSplitter.rejoin());

    const dependenciesStream = polymerProject.dependencies()
          .pipe(dependenciesStreamSplitter.split())
          .pipe(gulpif(/\.js$/, uglify()))
          .pipe(dependenciesStreamSplitter.rejoin());

    const result = mergeStream(sourcesStream, dependenciesStream)
      .pipe(gulp.dest('dist'));

    return waitFor(result);
  });
}

gulp.task('default', build);
