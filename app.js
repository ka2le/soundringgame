/*eslint-env node*/


//var cfenv = require( 'cfenv' );  
var express = require( 'express' );  
var http = require( 'http' );  
var ws = require( 'ws' );
var fs = require('fs');
var stream = fs.createWriteStream("public/index3.html");
stream.once('open', function(fd) {
	  stream.write('<!DOCTYPE html><html><body><p id="data">ITS DONE: </p></body></html>');
	  stream.end();
	});
var clients = [];
// Environment
//var environment = cfenv.getAppEnv();
var environment = [];
environment.port = 8080;
// Web
var app = express();

// Static
app.use( '/', express.static( 'public' ) );

// Sockets
var server = http.createServer();  
var sockets = new ws.Server( {  
  server: server
} );
console.log("Started");

var theHost;
var players = [];
var player1 = "";
var player2 = "";
var failedSend = []
var allowedStrikes = 2;
var rooms = [];
//-------------------------------------------------Room Stuff-----------------------------------------------------------------------------------------------------------------------------------------------
function addToRoom(newClient, ip){
	var foundRoom = false;
	for(var i =0; i<rooms.length; i++){
		if(rooms[i].ip == ip){
			foundRoom = true;
			rooms[i].clients.push(newClient);
			return [rooms[i].roomID, false];
		}
	}
	if(!foundRoom){
		var newRoom = [];
		newRoom.ip = ip;
		newRoom.clients = [];
		newRoom.clients.push(newClient);
		newRoom.roomID =  createRoomID()
		rooms.push(newRoom);
		return [newRoom.roomID, true];
	}
}
function createRoomID(){
	//ska uppdateras så att den kollar så det inte finns osv.
	return Math.floor(Math.random() * 99) + 1;
}
function findRoom(roomID){
	//var returnValue = -1;
	for(var i =0; i<rooms.length; i++){
		if(rooms[i].roomID == roomID){
			//returnValue = rooms[i];
			return rooms[i];
		}
	}
	return -1;
}
//-------------------------------------------------HSocket Stuff-----------------------------------------------------------------------------------------------------------------------------------------------
// Listeners
sockets.on( 'connection', function( client ) {  
  // Debug
  console.log( 'Connection.' );
  clients.push(client);
 // failedSend.push(0);
  console.log("------------------clients------------------------");
 // console.log(client);
  client.on( 'message', function( message ) {
	var res = message.substring(0, 2);
	//console.log(res);
	console.log(message);
	var jsonMessageData = JSON.parse( message )
	var intent = jsonMessageData.intent;
	console.log("intent:"+intent);
	if(intent=="serverTalk"){
		var messageType = jsonMessageData.value;
		var messageData = jsonMessageData.value2;
		if(messageType=="IP"){
			var roomInfo = addToRoom(client, messageData);
			var randomNumber = roomInfo[0];
			var isNewRoom = roomInfo[1];
			console.log("isNewRoom "+isNewRoom);
			client.send(createServerMessage("addedToRoom",randomNumber ,isNewRoom));
			//client.roomID = randomNumber;
		}
		if(messageType=="ID"){ 
			console.log("ID");
			var theRoom = findRoom(messageData);
			if(theRoom==-1){
				client.send(createServerMessage("noSuchID", messageData));
			}else{
				theRoom.clients.push(client)
				client.send(createServerMessage("addedToRoom",theRoom.roomID, false));
			} 
		}
		if(messageType=="resetRooms"){ 
			console.log("resetting rooms");
			rooms = [];
			client.send(createServerMessage("roomsCleared"));
		}
	}else{
		var roomID = jsonMessageData.roomID;
		broadcast(message, roomID);
	}
	
	
	

  } );
   client.on('disconnect', function() {
      console.log('Got disconnect!');
      var i = clients.indexOf(socket);
      clients.splice(i, 1);
	 // broadcast( createMessage("someoneDC"));
   });
} );
function broadcast(text, roomID){
	/*  for( var i = 0; i < clients.length; i++ ) {
		try{
			clients[i].send( text ); 
		}catch(err){
			console.log("Could not send to Client " + i + " error: " +err);
			//var forSender = ("Failed to send some other client with i: " +i+" error: " +err);
			//sendTo(client, forSender);
		}	 
    } */
	var currentRoom = findRoom(roomID);
	if(currentRoom != -1){
	 var roomClients =  currentRoom.clients;
		 for( var i = 0; i < roomClients.length; i++ ) {
			try{
				roomClients[i].send( text ); 
			}catch(err){
			//	console.log("Could not send to Client " + i + " error: " +err);
				//var forSender = ("Failed to send some other client with i: " +i+" error: " +err);
				//sendTo(client, forSender);
			}	 
		}
	}
	
	
}
function createServerMessage(serverIntent, data, data2){
			var message = {
			intent: "serverTalk",
			  value: serverIntent,
			  value2: data,
			  value3: data2,
			  sender: "server",
			  playerNumber: -1
			};
			var message =  JSON.stringify( message ) ;
			return message
}
function createMessage(text){
	return '{"content":"'+text+'"}';
}
function sendTo(theClient, text){
	try{
		theClient.send(createMessage(text));
	}catch(err){
		console.log("Error in sendTo(theClient, text) Error msg: " + err);
	}
	
	
}
// Start
server.on( 'request', app );  
server.listen( environment.port, function() {  
  console.log("environment.url");
  //console.log( environment.url );
} );


			/* failedSend[i]++;
			if(failedSend[i] > (allowedStrikes-1)){
				console.log("removing client"+ i);
				failedSend.splice(i, 1);
				clients.splice(i, 1);
			} */
//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------
/*
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/