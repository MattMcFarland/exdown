// builtin
var fs = require('fs');
var assert = require('assert');

// 3rd party
var express = require('express');
var expect = require('Chai').expect;
var request = require('request');

// local
var md = require('../../').create();

var app = express();

// manually set render engine, under normal circumstances this
// would not be needed as hbs would be installed through npm
app.engine('md', md.__express); // < -- Not normally needed

app.set('view engine', 'md');
app.set('views', [__dirname + '/views']);

app.use(express.static(__dirname + '/public'));

app.get('/empty', function (req, res) {
  res.send('empty')
});


app.get('/', function (req, res) {
  res.render('index', {
    title: 'Express Markdown Testing',
    boolean: true,
    array: ['apple', 'strawberry', 'pretzel'],
    table: [
      { name: 'Ms.Pacman',  highscore: 345,       rating: '3/5'},
      { name: 'Pacman',     highscore: 234543,    rating: '4/5'},
      { name: 'Galaga',     highscore: 345976439, rating: '5/5'}
    ],
    quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac massa sed erat rutrum interdum. Integer in felis tempus, euismod tellus et, condimentum ipsum',
    paragraph: 'Donec tempus ut quam in ultrices. Nulla porttitor molestie cursus. Donec interdum pharetra lectus, vitae sollicitudin nunc iaculis nec. Suspendisse semper tortor eget odio dignissim, vitae eleifend diam fringilla. Nam elementum ornare ligula, sed placerat orci tristique id. In hac habitasse platea dictumst. Donec quis tempor lectus. Nulla leo nulla, volutpat nec libero pellentesque, ultricies faucibus nulla. Donec eleifend malesuada maximus. Nunc ac aliquam lectus. Duis ornare mi a ullamcorper molestie. Ut id velit sed quam vestibulum facilisis at ac tellus. Sed ac ligula id sapien fringilla volutpat a sed lectus.'
  })
});

app.get('/no_layout', function (req, res) {
  res.render('no_layout', {
    layout: false,
    title: 'Express Markdown Testing',
    boolean: true,
    array: ['apple', 'strawberry', 'pretzel'],
    table: [
      { name: 'Ms.Pacman',  highscore: 345,       rating: '3/5'},
      { name: 'Pacman',     highscore: 234543,    rating: '4/5'},
      { name: 'Galaga',     highscore: 345976439, rating: '5/5'}
    ],
    quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac massa sed erat rutrum interdum. Integer in felis tempus, euismod tellus et, condimentum ipsum',
    paragraph: 'Donec tempus ut quam in ultrices. Nulla porttitor molestie cursus. Donec interdum pharetra lectus, vitae sollicitudin nunc iaculis nec. Suspendisse semper tortor eget odio dignissim, vitae eleifend diam fringilla. Nam elementum ornare ligula, sed placerat orci tristique id. In hac habitasse platea dictumst. Donec quis tempor lectus. Nulla leo nulla, volutpat nec libero pellentesque, ultricies faucibus nulla. Donec eleifend malesuada maximus. Nunc ac aliquam lectus. Duis ornare mi a ullamcorper molestie. Ut id velit sed quam vestibulum facilisis at ac tellus. Sed ac ligula id sapien fringilla volutpat a sed lectus.'
  })
});

var http = require('http');

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

var baseURI = 'http://localhost:' + port + '/';

describe('server response', function () {

  before(function () {
    server.listen(port);
  });
  it('should return 200', function (done) {
    request.get(baseURI, function (err, res, body) {
      if (err) {
        throw (err);
      }
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
  it('text with layout should match fixtures', function (done) {
    var expected = fs.readFileSync(__dirname + '/../fixtures/index.html', 'utf8');
    request.get(baseURI, function (err, res, body) {
      console.log(body);
      if (err) {
        throw (err);
      }

      assert.ok(body, expected);
      done();
    });
  });
  it('text without layout should match fixtures', function (done) {
    var expected = fs.readFileSync(__dirname + '/../fixtures/no_layout.html', 'utf8');
    request.get(baseURI+ 'no_layout', function (err, res, body) {
      if (err) {
        throw (err);
      }
      assert.equal(body, expected);
      done();
    });
  });
  after(function () {
    server.close();
  });

});
