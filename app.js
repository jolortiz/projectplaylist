/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var path= require('path');
var socketEvents = require('./controllers/socketEvents')
var http = require('http');

//var stateKey = 'spotify_auth_state';

/*var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};*/

var index = require('./routes/index');

//var client_id = '3819f8f33b8e48e496a4babf32e60907'; // Your client id
//var client_secret = 'bc19c389323740738b64c637880e680e'; // Your secret
///var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */


//var stateKey = 'spotify_auth_state';

var app = express();
var server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(express.static(__dirname + '/public'))
  // .use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

app.use('/', index);



module.exports = app;


/*
* MONGOOSE Code
*
*/

var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin@ds137090.mlab.com:37090/musaicdb')
//mongoose.set('debug', true);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to database");
});

console.log('Listening on 8888');
const io = require('socket.io').listen(server);
server.listen(process.env.PORT || 8888);

/*
* Socket.io stuff
*
*
*/
io.on('connection', (socket) => {
  console.log('User connected');

  //Join playlist "channel"
  socket.on('join', (playlist) => {
    //console.log('Joining playlist ' + playlist);
    socket.join(playlist);
  });

  //Leave playlist channel
  socket.on('Leave playlist', (playlist) => {
      socket.leave(playlist);
  });

  socket.on('refresh', (playlist) => {
      //console.log('Refreshing all pages');
      io.sockets.emit('refresh tracks', playlist);
      //io.sockets.in(playlist).emit('refresh tracks', playlist);
  });

  socket.on('Disconnect', () => {
      console.log('User disconnected');
  });
});
