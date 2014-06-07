/**
 * @fileOverview The Privly key server setup file, describes how to setup the
 * express js server.
 *
 */

var http = require('http');

// Setup the endpoints for the key server
var express = require('express');
    index = require('./routes/index'),
    search = require('./routes/search'),
    store = require('./routes/store');




// Configuration
const PORT = 5000;
const AUDIENCE = "http://localhost:" + PORT;

var app = express();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  // Change this session secret before putting into production.
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.csrf());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', index.index);
app.post('/auth', index.auth(AUDIENCE));
app.get('/logout', index.logout);
app.get('/store', store.store);
app.get('/search', search.search);

var server = http.createServer(app);
server.listen(PORT, function() {
    console.log("Express server listening on port %d in %s mode", PORT, app.settings.env);
});

module.exports = server;
