#!/usr/bin/env node

const execa = require('execa');
const shell = require('shelljs');
const path = require('path');
const chalk = require('chalk');
const minify = require('html-minifier').minify;
const fs = require('fs');

// Create directories
shell.mkdir('-p', 'dist');
shell.mkdir('-p', 'dist/css');

// Copy images
console.log(chalk`{green.inverse Copying Images}`);
shell.cp('-R', 'images/', 'dist/images');

// Minify and copy html
console.log(chalk`{green.inverse Minifying HTML}`);
shell.find('src/**/*.html').forEach(htmlFile => {
  minifyHtml(htmlFile);
});

// Run rollup
console.log(chalk`{green.inverse Rollup}`);
build();

// Manifest
shell.cp('manifest.json', 'dist/manifest.json');

//TODO support non root html files
function minifyHtml(fileName) {
  if (isProduction()) {
    const default_options = {
      caseSensitive: false,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      decodeEntities: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    };

    const newFileName = fileName.split('/').slice(-1)[0];
    const file = fs.readFileSync(fileName, 'utf8');
    const minfile = minify(file, default_options);

    fs.writeFileSync(`dist/${newFileName}`, minfile, 'utf8');
  } else {
    shell.cp(fileName, 'dist');
  }
}

function build() {
  const args = ['-c', path.resolve('build/rollup.config.js')];
  if (!isProduction()) {
    args.push('-m');
  }
  execa.sync('rollup', args, {
    stdio: 'inherit',
  });
}

function isProduction() {
  if (!process.env.PRODUCTION && !process.env.isDevelopment) {
    return false;
  }
  return process.env.PRODUCTION === 'true';
}
