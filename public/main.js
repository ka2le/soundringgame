var socket = null;

function startConnection(){
	// WebSocket
	if(window.location.host=="localhost:4330" || window.location.host=="localhost"){
		console.log("WebSocket is not used on localhost");
	}else{
		socket = new WebSocket( 'ws://' + window.location.host  );  
		socket.addEventListener( 'message', doSocketMessage );
		console.log(socket);
		socket.onopen = function () {
			 // alert("Connected");
			  continueOnload();
		};
		setInterval(function(){ 
			if(socket.readyState == 3){
				reconnect();
			}
		}, 1000);
	}
}
function reconnect(){
	socket = new WebSocket( 'ws://' + window.location.host );  
	socket.addEventListener( 'message', doSocketMessage );
	socket.onopen = function () {
		 console.log("Re-Connected");
		 // continueOnload();
		 handleReconnect();
	};
}
function sendToServer(text){
	socket.send(text);
}
function send(intent, value, value2){
	if(window.location.host=="localhost:4330" || window.location.host=="localhost"){
			
	}else{
			var message = {
			intent: intent,
			  value: value,
			  value2: value2,
			  sender: role,
			  uniqueID:uniqueID,
			  playerNumber: playerNumber,
			  roomID: roomID
			};
			socket.send( JSON.stringify( message ) );	
		}
}

function doSocketMessage( message ) {
	  var data = JSON.parse( message.data );
	  var intent = data.intent;
	  handleInput(data); 
}




//------------------------------------------------Canvas----------------------------------------------------------------------------------------------------------------------------------------------

function initCommonJquery(){
	$(".menuButton").click(function() {
        toggleMenu();
    });
	

}


//---------------------------------------------Other---------------------------------------------------------------------------------------------------------------------------------------------------------
function addZeroes (str) {
  str = str.toString();
  return str.length < 4 ? addZeroes("0" + str, 4) : str;
}