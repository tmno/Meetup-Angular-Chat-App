#github.com/madmobile

Meetup - Angular Chat App
=======================

##Required Downloads

####1) Install GIT:
http://git-scm.com/download/win

http://git-scm.com/download/mac

####2) Install Node:
http://nodejs.org/

###Local Database:

####3) Install Mongo Locally (or use VirtualBox):
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/

http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/

###Or Virtual Box Database:

####3) Install VirtualBox/Mongo:
https://www.virtualbox.org/wiki/Downloads

####3.1) Ubuntu:
http://www.ubuntu.com/download/server

####3.2) Mongo:
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

###Or MongoLabs (Free)

####3) Mongo Labs:
https://mongolab.com/plans/pricing/



##Optional Downloads

####Install Webstorm:
https://www.jetbrains.com/webstorm/download/

####Install Robomongo:
http://robomongo.org/download.html


# Run the test project

First, open a terminal or command prompt and cd into a directory to clone the test project.

    git clone https://github.com/MadMobile/Meetup-Angular-Chat-App.git

    npm install

    npm start

Now you should be able to point your browser to `http://localhost:3000/` and see the "Hello world!" page.


#Node.js Tutorial Notes From our class

##Intro To Node
node.js is server side javascript running on Google's V8 engine
	- fast
	- async
	- single threaded
	- excels in IO heavy server side implementations
	- let's us have full stack javascript narrowing down the amount of skills required
##Hello world:
to run, just cd to directory and type:
node hello.js

```javascript
console.log('hello world');
```

##Improved Hello World

A more useful hello world would be to create an http server that listens for request and replies with hello world

```javascript
//we require the http  module that is part of the node.js core
var http = require('http');
//create a server that listens to port 80
http.createServer(function (req, res) {
	//this code runs on every http request and replies with Hello World
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World');
}).listen(80);
```

##node modules

Besides the core modules there is a vast amount of modules out there that can help you build you applications faster.

NPM (node package manager) is used to install modules in your application. It is as easy as running the following command in the root of your project:

npm install some_module

This command will save the module in a folder called node_modules

Now to use the module in your code all you have to do is require the module like this:

```javascript
var myModule = require('myModule')
```

In the same way every file in your application can be included using the same syntax:
```javascript
var controller = require('./path/to/controller');
```

##package.json

In your repo you will normally have the node_modules directory on ignore and will only want to actually save a list of module dependencies that need to be installed. Tha is done with the package.json

This file has a list of all your dependencies and then when you want to install all dependencies to the app all you need to do is cd to the root and run the following command:

npm install

When adding a new module to your app make sure to add the --save or --save-dev flag when installing to make sure that it is automatically added to the package.json file:
npm install myModule --save




##Express.js
The default http module is great and all but when you want to make a real world app there are a lot of features you would expect from a web server that you need to implement from scratch with node unless you use a module like express.

Express enhances the http module to allow you to create a server with pluggable middleware that will give you a lot of functionality out of the box.

Our hello world example using express will become the following:

```javascript
var express = require('express')
var app = express()

//we are using the static middleware that will give as the ability to serve static files inside of the public folder
app.use(express.static('public'));

//we can now route and specify routes to match and use http verbs such as get post put
app.get('/', function (req, res) {
  res.send('Hello World')
});

var server = app.listen(80);
```

###Creating your own middleware
Let's say we wanted to protect all our api calls with some authentication:
```javascript
app.use(function(req,res,next){
	if(tokenValid()){
		next();
	}else{
		res.json(403, 'Forbidden');
	}
});
```

(Slide 7)
##WebSockets and socket.io
Since we are building a real time chat application we need the ability for the server to be able to push messages to the client.

http will only allow for the client to send requests and receive responses and not the other way around. HTML 5 introduced WebSockets which allows you to do just that.

socket.io is a great library that helps makes working with WebSockets really easy and providing cross browser fall backs for browsers that do not support websockets

Example of using socketio:

server side code:

```javascript
var socketio = require('socket.io')(server);
var express = require('express');
var app = express();
var server = require('http').Server(app);

//we are using the static middleware that will give as the ability to serve static files inside of the public folder
app.use(express.static('public'));

//we can now route and specify routes to match and use http verbs such as get post put
app.get('/', function (req, res) {
  res.send('Hello World')
});
//every time a user makes a new webSocket connection this fires
socketio.on('connection', function (socket) {
	//using the socket object we can now listen to any messages that the client sends
	socket.on('message',function(data){
		//then the server can emit a message using the socketio object and all clients that are listening for that event
		//will receive that message
		socketio.emit('message',data));
	});
});

server.listen(80);
```


client side code:

```
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<script src="/socket.io/socket.io.js"></script>

	<script>
		var socket = io.connect('http://localhost:3333');
		//the client sends a message to the server
		socket.emit('message','Hello Everyone');

		//the client binds to 'message' so whenever the server emits this message it will cause this to be triggered
		socket.on('message',function(msg){
			console.log(msg)
		});

	</script>
</head>
<body>
</body>
</html>
```
