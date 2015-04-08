var
  fs = require('fs'),
  path = require('path'),
  walk = require('walk').walk,
  _ = require('lodash'),
  ejs = require('ejs'),
  marked = require('marked'),
  async = require('./async'),
  defaultOptions = {
    gfm: true,
    tables: true,
    smartLists: true,
    breaks: false,
    pedantic: true,
    sanitize: true
  };


function Instance() {
  this.marked = marked;
  this.ejs = ejs;
  this.cache = {};
  this.__express = middleware.bind(this);
}

function middleware(filename, _options, cb) {
  var self = this;
  var cache = self.cache;
  var marked = self.marked;
  var options = _.extend(_options, defaultOptions);
  var ejs = self.ejs;
  self.async = async();

  // set marked options
  marked.setOptions({
    gfm: options.gfm,
    tables: options.tables,
    smartLists: options.smartLists,
    breaks: options.breaks,
    pedantic: options.pedantic,
    sanitize: options.sanitize
  });

  var extension = path.extname(filename);

  // render the original file
  // cb(err, str)
  function render_file(locals, cb) {
    // cached?
    var template = cache[filename];
    if (template) {
      return cb(null, ejs.render(locals));
    }

    fs.readFile(filename, 'utf8', function(err, str){
      if (err) {
        return cb(err);
      }
      if (extension === '.md') {
        str = self.compile(str);
      }
      var locals = options;
      var template = ejs.render(str, locals);
      if (options.cache) {
        cache[filename] = template;
      }

      try {
        var res = ejs.render(str, locals);
        self.async.done(function(values) {
          Object.keys(values).forEach(function(id) {
            res = res.replace(id, values[id]);
          });

          cb(null, res);
        });
      } catch (err) {
        err.message = filename + ': ' + err.message;
        cb(err);
      }
    });
  }

  // render with a layout
  function render_with_layout(template, locals, cb) {
    render_file(locals, function(err, str) {
      if (err) {
        return cb(err);
      }

      var locals = options;
      locals.body = (str);

      var res = self.escape(ejs.render(template, locals));
      self.async.done(function(values) {
        Object.keys(values).forEach(function(id) {
          res = res.replace(id, values[id]);
        });

        cb(null, res);
      });
    });
  }

  var layout = options.layout;

  // user did not specify a layout in the locals
  // check global layout state
  if (layout === undefined && options.settings && options.settings['view options']) {
    layout = options.settings['view options'].layout;
  }

  // user explicitly request no layout
  // either by specifying false for layout: false in locals
  // or by settings the false view options
  if (layout !== undefined && !layout) {
    return render_file(options, cb);
  }

  var view_dirs = options.settings.views;

  var layout_filename = [].concat(view_dirs).map(function (view_dir) {
    var view_path = path.join(view_dir, layout || 'layout');

    if (!path.extname(view_path)) {
      view_path += '.html';
    }

    return view_path;
  });

  var layout_template = layout_filename.reduce(function (cached, filename) {
    if (cached) {
      return cached;
    }

    var cached_file = cache[filename];

    if (cached_file) {
      return cache[filename];
    }

    return undefined;
  }, undefined);

  if (layout_template) {
    return render_with_layout(layout_template, options, cb);
  }

  function cacheAndCompile(str) {

    var layout_template = str;
    if (options.cache) {
      cache[layout_filename] = layout_template;
    }

    render_with_layout(layout_template, options, cb);
  }

  function tryReadFileAndCache(templates) {
    var template = templates.shift();

    fs.readFile(template, 'utf8', function(err, str) {
      if (err) {
        if (layout && templates.length === 0) {
          // Only return error if user explicitly asked for layout.
          return cb(err);
        }

        if (templates.length > 0) {
          return tryReadFileAndCache(templates);
        }

        return render_file(options, cb);
      }

      cacheAndCompile(str);
    });
  }

  tryReadFileAndCache(layout_filename);
}

Instance.prototype.escape = function(str) {
  return str
    .replace(/<nop>/g, '')
    .replace(/<\/nop>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, "\"")
    .replace(/&amp;/g, '&')
};

Instance.prototype.compile = function(str, options) {

  try {
    var compiled = this.escape(this.marked(str));
    return compiled;
  } catch (error) {
    return error;
  }
};


module.exports = new Instance ();
module.exports.create = function () {
  return new Instance();
};
