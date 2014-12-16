var config = require('./config');
var _ = require('lodash-node');
var express = require('express');
var bodyParser  = require('body-parser');
var app = express();
var server = require('http').Server(app);
var socketio = require('socket.io')(server);
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

app.use(express.static('ui'));				// serve static files from the ui folder
app.use(bodyParser.json());					// parse application/json


MongoClient.connect(config.mongoConnection, function(error, db) {

	//log any error we get from trying to connect to our mongo database
	if(error){
		console.error(error);
	}


	app.post('/api/login',function(req,res){
		db.collection('users').findOne({username: req.body.username, password: req.body.password}, function(err, data) {

			if (err) {
				res.send(err);
			} else if (!data) {
				res.json(401, {
					error:'Wrong user or password'
				});
			} else {
				// Remove sensitive data before delivering payload
				delete data.password;
				res.json(data);
			}
		});
	});

	app.post('/api/createAccount',function(req, res){

		// Assign all new users a 'participant' role
		req.body.role = 'participant';

		db.collection('users').insert(req.body, {w:1}, function(err, data) {
			if (err){
				res.send(err);
			}
			res.json(data[0]);
		});
	});


	var connectedUsers = [];

	function removeConnectedUser(id){
		var idx = _.findIndex(connectedUsers, { 'socketId': id });
		var user = connectedUsers[idx];
		connectedUsers.splice(idx, 1);
		return user;
	}


	socketio.on('connection', function (socket) {
		//socket.handshake.headers -> in case we decide to check and see if the cookies are set, although we don't really need this since all events here will contain the user ID

		socket.on('userConnect',function(user, callback){
			_.extend(user, {socketId: this.id, messages:[]});
			connectedUsers.push(user);
			socketio.emit('userConnected', user, connectedUsers);
			callback(user._id);
		});

		socket.on('userDisconnect',function(user, callback){
			var userRemoved = removeConnectedUser(this.id);
			socketio.emit('userDisconnected', userRemoved, connectedUsers);
			callback(connectedUsers);

		});

		socket.on('disconnect', function () {
			console.log('Transport closed for socket ' + this.id)

			// Need to remove user by assigned socketId
			var userRemoved = removeConnectedUser(this.id);
			socketio.emit('userDisconnected', userRemoved, connectedUsers);
		});

		socket.on('message',function(message, callback){
			socketio.emit('message:' + message.toId, message, connectedUsers);
			callback(connectedUsers);
		});
	});

	server.listen(config.port);
	console.log('Server listening on port ' + config.port);
});


