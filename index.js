'use strict';

var fs = require('fs');
var yaml = require('yamljs');
var swaggerDist = require('swagger-ui-dist');

var serveStatic = require('koa-static');

var favIconHtml = '<link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />' +
                  '<link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />'

var setup = function(swaggerDoc, options) {
	options = options || {};

	if (options.yaml) {
	  swaggerDoc = yaml.parse(swaggerDoc);
  }

  var explorerString = options.explorer ?  '' : '.swagger-ui .topbar .download-url-wrapper { display: none }';
	var customCss = explorerString + ' ' + options.customCss || explorerString;
	var customfavIcon = options.customfavIcon || false;
	var html = fs.readFileSync(__dirname + '/indexTemplate.html');
    try {
    	fs.unlinkSync(__dirname + '/index.html');
    } catch (e) {

    }
    var htmlWithSwaggerReplaced = html.toString().replace('<% swaggerDoc %>', JSON.stringify(swaggerDoc));
    var favIconString = customfavIcon ? '<link rel="icon" href="' + customfavIcon + '" />' : favIconHtml;
    var indexHTML = htmlWithSwaggerReplaced.replace('<% customOptions %>', stringify(options))
    var htmlWithCustomCss  = indexHTML.replace('<% customCss %>', customCss);
    var htmlWithFavIcon  = htmlWithCustomCss.replace('<% favIconString %>', favIconString);

    return function(ctx) {
      ctx.type = 'html';
      ctx.body = htmlWithFavIcon;
    };
};

var serve = serveStatic(swaggerDist.getAbsoluteFSPath());

var stringify = function(obj, prop) {
  var placeholder = '____FUNCTIONPLACEHOLDER____';
  var fns = [];
  var json = JSON.stringify(obj, function(key, value) {
    if (typeof value === 'function') {
      fns.push(value);
      return placeholder;
    }
    return value;
  }, 2);
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function(_) {
    return fns.shift();
  });
  return json + ';';
};

module.exports = {
	setup: setup,
	serve: serve
};
