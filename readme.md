## Broccoli AngularJs Template Cache

Broccoli plugin to inline angular templates using $templateCache

## Install

npm install --save broccoli-angular-templates-cache

## Usage

```
var angularTemplates = require("broccoli-angular-templates-cache");

module.exports = angularTemplates('templates', {
  srcDir: './',
  destDir: './',
  prepend: 'partials/',
  strip: 'templates/',
  minify: {
  	collapseWhitespace: true
  },
  fileName:'templates.js',
  moduleName:'angularApp'
});

```

## Options

#### srcDir

path to source directory

#### destDir

path to destination directory

### ignore

Type: `[string]`
Default: `[]`

File patterns to ignore when searching for templates.

#### prepend
Type: `String`
Default: ``

Path fragment to insert before the template path

#### strip

Type: `String`
Default: ``

Path fragment to remove from template path (from left)

#### minify

Type: `Object`
Default: `false`

Configs to pass on [html-minifier](https://github.com/kangax/html-minifier).
If ommitted, the HTML is kept untouched


#### moduleName

Name of `$templateCache` module

## LICENSE

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
