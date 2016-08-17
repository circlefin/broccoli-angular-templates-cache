var CachingWriter = require('broccoli-caching-writer'),
rsvp= require('rsvp'),
recursive = require('recursive-readdir'),
_ = require('lodash'),
htmlMin = require('html-minifier').minify,
fs = require("fs"),
mkdirp = require('mkdirp'),
path = require("path");
minimatch = require('minimatch');

var reQuote = /'/g,
escapedQuote = '\\\'',
reNewLine = /\r?\n/g,
escapedNewLine = '\\n\' +\n \'';

function escapeHtmlContent(content) {
	return content.replace(reQuote, escapedQuote).replace(reNewLine, escapedNewLine);
}
function escapeTags(content) {
	return content.replace(/</mg, '&lt;').replace(/>/mg, '&gt;');
}
function angularModuleTemplate(moduleName, templateCode) {
	return 'angular.module("' + moduleName + '").run([\'$templateCache\', function(a) { ' + templateCode + ' }]);';
}
function transformTemplates(templates, strip, prepend, minify) {
	var cacheOutput = '',
	i = templates.length;
	while (i--) {
		cacheOutput += transformTemplateEntry(templates[i], strip, prepend, minify);
	}
	return cacheOutput;
}
function transformTemplateEntry(entry, strip, prepend, minify) {
	var path = entry.path,
	content = entry.content,
	parseError;
	if (strip) {
		path = path.split(strip);
		path.shift();
		path = path.join(strip).replace(/\\/g, '/');
	}
	if (prepend) {
		path = prepend + path;
	}
	if (minify !== false) {
		try {
			content = htmlMin(content, minify);
		} catch (e) {
			parseError = String(e);
			throw new Error(parseError, entry.path);
		}
	}
	content = escapeHtmlContent(content);
	return 'a.put(\'' + path + '\', \'' + content + '\');\n\t';
}

var BroccoliAngularTemplateCache = function BroccoliAngularTemplateCache(inTree, options) {
	if (!(this instanceof BroccoliAngularTemplateCache)) {
    	return new BroccoliAngularTemplateCache(inTree, options);
  }
  this.inputTree = inTree;
  this.options = options || {};
	CachingWriter.apply(this, arguments);
};
BroccoliAngularTemplateCache.prototype = Object.create(CachingWriter.prototype);
BroccoliAngularTemplateCache.prototype.constructor = BroccoliAngularTemplateCache;
BroccoliAngularTemplateCache.prototype.description = 'angular templates cache';


BroccoliAngularTemplateCache.prototype.updateCache = function(srcDir, destDir) {
	var self = this,dest;

	var src = path.join(srcDir[0],self.options.srcDir);

  if(self.options.absolute){
    dest = self.options.destDir+'/'+self.options.fileName;
  }else{
    dest = path.join(destDir,self.options.destDir+'/'+self.options.fileName);
  }
	mkdirp.sync(path.dirname(dest));

	var promise = new rsvp.Promise(function(resolvePromise, rejectPromise) {
		recursive(src, self.options.ignore || [], function (err, files) {

			var templates = [],
			minify = self.options.minify || false,
			prepend = self.options.prepend || false,
			strip = self.options.strip || false,
			moduleName = self.options.moduleName,
			firstFile = null,
			filePath;

			if (self.options.include) {
				files = files.filter(function(file) {
					return self.options.include.reduce((prev, current) => prev || minimatch(file.split('/').pop(), current), false);
				});
			}

			_.each(files, function(file){
				if(self.options.absolute){
					filePath = file.replace(path.dirname(srcDir[0])+'/','');
				}
				templates.push({
					path: filePath || file,
					content: fs.readFileSync(file).toString('utf-8')
				});
			});
			var joinedContents = transformTemplates(templates, strip, prepend, minify);
			var module = angularModuleTemplate(moduleName, joinedContents);
			fs.writeFile(dest,module,function(err){
				if(err){
					rejectPromise(err);
				}else{
					resolvePromise('templates created');
				}
			});
		});
	});
	return promise;
}
module.exports = BroccoliAngularTemplateCache;
