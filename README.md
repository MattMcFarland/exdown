# express-markdown [![Build Status](https://travis-ci.org/MattMcFarland/express-markdown.svg?branch=v0.1.5)](https://travis-ci.org/MattMcFarland/express-markdown)

[Express.js](http://github.com/visionmedia/express) view engine for Markdown with EJS templating.

## Install ##

```
npm install exdown
```

## Use ##

Using *md* as the default view engine requires just one line of code in your app setup. This will render `.md` files when `res.render` is called.

```javascript
app.set('view engine', 'md');
```

To use a different extension (i.e. html) for your template files:

```javascript
app.set('view engine', 'html');
app.engine('html', require('md').__express);
```

## Supported Markdown ##

 * Headings
 * Lists (limited)
 * Blockquotes

## Supported Templating ##

express-markdown comes with `ejs` out of the box, so you can use ejs templating like so:

```markdown
  ## Testing
  
  ### Boolean
  <%= boolean %>
  
  ### Array
  
  <% for(var i=0; i<array.length; i++) {%>
  
   * <%= array[i] %>
   
  <% } %>
  
  ### Blockquote
  
   > <%= quote %>
   
  ### Paragraph
  
  <%= paragraph %>
```

## Caveats ##

There are a few strange things that happen with lists.  Using lists like above will cause too many `<ul>` tags.  The workaround is to use `html` as any html will be accepted in your md file as well.


## Recipes ##

### more than one instance ###
You can create isolated instances of hbs using the `create()` function on the module object.

```javascript
var md = require('md');

var instance1 = md.create();
var instance2 = md.create();

app.engine('html', instance1.__express);
app.engine('md', instance2.__express);
```

Each instance has the same methods/properties as the `md` module object. The module object is actually just an instance created for you automatically.
