var roomID = -1;
var role = "palyer";
var playerNumber = 0;
var uniqueID;
var players = [];
var playerTurn = 0;
var numberOfPlayers = 0;
var maxNumberOfPlayers = 4;
var teamColors = ["blue", "red", "yellow", "green", "black"];
var cheatsOn = false;
var currentPlayerNumber;
var finishedLoaded = false;
var playerName = "";
var mode = "starting";
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
var vibrationLibrary = {
"vib1":[[300,100,300],[100]],
"almostNothing":[[30,20,10,70,10],[1200]],
"vibName":[[500,500],[200]]
};
var allRounds = [];
var allTurns = [];
var currentRoundNumber = 0;
var turnNumber = 0;
var turnInterval;
var currentTurnType; 	


function onload(){
	//console.log("start");
	var url = window.location.href;
	uniqueID = Math.floor(Math.random()*10000000000)+1;
	console.log("unique id "+ uniqueID)
	var urlSplit = url.split("#");
	console.log(urlSplit);
	if(urlSplit.length>1){
		role = urlSplit[1];
		createPlayer(uniqueID);
	}
	console.log("I am "+role);
	startConnection();
	resetVariables();
	jQueryInits();
	initCommonJquery();
	//createPlayers();
	console.log(players);
	showPlayers();
		createRounds();
	createTurns();
 
}

function continueOnload(){
	//console.log("continueOnload does nothing now on host.");
	console.log("hej");
	if(role=="host"){
		var joinIP = Math.floor(Math.random()*10000000)+1;
		console.log(joinIP);
		send("serverTalk", "IP", joinIP);
	}else{
		document.getElementById("joiningDiv").innerHTML = "Enter room id: <br><input type='text' placeholder='Room ID' id='roomIDInput'> <input id='joinFromInputButton' type='button' value='Join' onclick='joinFromInput()'><br><br><br><a onclick='reloadPage()' href='#host'>Become Host</a><br> "
	}
	//send("serverTalk", "IP", json.ip);
	 /* $(function() {
    $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
      function(json) {
        alert("My public IP address is: ", json.ip);
		send("serverTalk", "IP", json.ip);
		//joinByID(30);
      }
    );
  }); */
  
}
function continueOnload2(){
	finishedLoaded = true;
	send("iAmReady");
	$("#joiningDiv").hide();
	document.getElementById("roomID").innerHTML = "Room ID: "+ roomID;
	playerName =  localStorage.getItem("playerName");
	console.log("player Name "+ playerName);
	if(playerName===null){
		send("getName");
	}else{
		setUserName(playerName);
	}
	if(role=="host"){
		$(".hostOnly").show();
	}else{
		
	}
}
function resetVariables(){
	currentPlayerNumber = 0;
}


function joinFromInput(){
	var joinID = document.getElementById("roomIDInput").value;
	joinByID(joinID);
}
//-------------------------------------------------Handle Input-----------------------------------------------------------------------------------------------------------------------------------------------
function handleServerTalk(intent, data, data2){
	console.log("server wants "+ intent);
	console.log("data "+data);
	console.log("data2 "+data2);
	if(finishedLoaded){
		console.log("I am loaded");
	}else{
		if(intent=="addedToRoom"){
			roomID = data;
			var isNewRoom = data2;
			continueOnload2();
		}
		if(intent=="noSuchID"){
			console.log("Room Not Found");
		}
	}
}


function joinByID(id){
	console.log("trying to join room with ID "+id);
	send("serverTalk", "ID", id);
}	
function handleInput(data){
	var intent = data.intent;
	console.log(data);
	
	if(intent=="serverTalk"){
		console.log("serverTalk");
		handleServerTalk(data.value, data.value2, data.value3);
	}else if(data.uniqueID == uniqueID){
		console.log("my own message");
	}
		if(role=="host"){
		//	console.log("Host got message");
			if(intent=="reconnect" || intent=="iAmReady"){
			//	console.log("someone joined");
				if(findPlayerById(data.uniqueID)=="notFound"){
					//console.log("Creating player");
					createPlayer(data.uniqueID);
				if(mode=="starting"){
					showPlayers();
				}
				}else{
				//	console.log("Player Exist");
				}
			}
			
			if(intent=="myNameIs"){
				console.log("Updatating dispaly name")
				findPlayerById(data.uniqueID).name = data.value;
				showPlayers();
			}
			if(intent=="getName"){
				var currentName = findPlayerById(data.uniqueID).name;
				send("yourNameIs",currentName,  data.uniqueID);
			}
			if(intent=="buttonClick"){
				hostHandleButtonClick(data.uniqueID);
			}
		}else{
			if(intent=="startGame"){
				$("#playerManaging").hide();
				$("#gameContainer").show();
			}
			if(intent=="startRound"){
				currentRoundNumber = data.value;
			}
		}
		if(data.value2 == uniqueID){
			console.log("messageJustForMe");
			if(intent=="yourNameIs"){
				setUserName(data.value);
			} 
			if(intent=="yourTurn"){
				handleTurn(data.value);
			} 
		}
	
}	


function handleReconnect(){
	 joinByID(roomID);
}


//------------------------------------------------Player stuff----------------------------------------------------------------------------------------------------------------------------------------------
function findPlayerById(id){
	for(var i = 0; i<players.length; i++){
		if(players[i].id==id){
			return players[i];
		}
	}
	return "notFound";
}
function updateUserNameFromInput(){
	setUserName(document.getElementById("userNameInput").value);
}
function setUserName(name){
	console.log("settingUserName")
	localStorage.setItem("playerName", name);
	playerName= name;
	document.getElementById("userNameInput").value =name;
	send("myNameIs", playerName);
}
function createPlayer(id){
	var newPlayer = [];
	newPlayer.id= id;
	newPlayer.arrayPos = players.length;
	newPlayer.score = 0;
	newPlayer.name = "Player "+ String(players.length+1);
	newPlayer.acctive=false;
	players.push(newPlayer);
	
	console.log(players);
}
function activatePlayer(id){
	players[id].active = true;
	$("#player"+(id+1)).show();
}
function resetPlayerScore(){
	for(var i = 0; i<players.length; i++){
		players[i].score = 0;
	}
}
function showPlayers(){
	console.log("showingPlayers");
	var text ="";

	for(var i = 0; i<players.length; i++){
		if(i==0){
			text += '<div class="playerBox" > <br>'+players[i].name+' <input type="button" value=">" onclick="switchUp('+players[i].arrayPos+')"></div>';
		}else if(i==players.length-1){
			text += '<div class="playerBox" ><input type="button" value="<" onclick="switchDown('+players[i].arrayPos+')"> <br>'+players[i].name+'</div>';
		}else{
			text += '<div class="playerBox" ><input type="button" value="<" onclick="switchDown('+players[i].arrayPos+')"> <br>'+players[i].name+' <input type="button" value=">" onclick="switchUp('+players[i].arrayPos+')"></div>';
		}
		
	}
	document.getElementById("playerManaging").innerHTML= text;
}
function updatePlayerInfo(){
	
}
function switchDown(pos){
	switchPlayers(players[pos].id, players[pos-1].id);
	showPlayers();
}
function switchUp(pos){
	switchPlayers(players[pos].id, players[pos+1].id);
	showPlayers();
}
function switchPlayers(id1, id2){
	//console.log(switchPlayers);
	var arrayPos1 = findPlayerById(id1).arrayPos;
	var arrayPos2 = findPlayerById(id2).arrayPos;
	players[arrayPos1].arrayPos = arrayPos2;
	players[arrayPos2].arrayPos = arrayPos1;
	var tempPlayer = players[arrayPos1];
	players[arrayPos1] = players[arrayPos2];
	players[arrayPos2] = tempPlayer;
	
}
//-------------------------------------------------RoundStuff----------------------------------------------------------------------------------------------------------------------------------------------

function resetVariables(){
	currentPlayerNumber = 0;
	playerTurn = 0;
	currentRoundNumber = 0;
}

function startGame(){
	resetVariables();
	mode = "started";
	$("#playerManaging").hide();
	$("#gameContainer").show();
	send("startGame");
	newRound(currentRoundNumber);
}
function startRound(round){
	resetVariables();
	currentRoundNumber =round;
	mode = "started";
	$("#playerManaging").hide();
	$("#gameContainer").show();
	send("startGame");
	newRound(currentRoundNumber);
}


function createRounds(){
	allRounds = [];
	createRound(["normalTurn","normalTurn","normalTurn","normalTurn","normalTurn",
	"normalTurn","normalTurn","normalTurn","normalTurn","normalTurn","normalTurn",
	"normalTurn","normalTurn","normalTurn","normalTurn","normalTurn","normalTurn",
	"normalTurn","normalTurn","normalTurn","normalTurn","normalTurn","ghostTurn",
	"normalTurn","normalTurn","ghostTurn","normalTurn","normalTurn","normalTurn",
	"normalTurn","normalTurn","normalTurn","normalTurn","normalTurn","normalTurn"],
	3000, [0,1,10,11,17],["background.mp3","tut1_part1.wav","ghost.mp3", "tut1_part2.wav", "tut1_part3.wav"], [0.5,1,1,1,1],);
	
	createRound(["normalTurn","normalTurn","ghostTurn","normalTurn","normalTurn",
	"normalTurn","ghostTurn","normalTurn","normalTurn","ghostTurn",
	"normalTurn","normalTurn","ghostTurn","normalTurn","normalTurn"],
	2000, [0],["background.mp3"], [0.5]);
}
function createRound(turns, speed, soundPositions, soundNames, soundVolumes){
	var newRound = [];
	newRound.turns = turns;
	newRound.soundPositions = soundPositions;
	newRound.soundNames = soundNames;
	var soundObjects = [];
	for(var i = 0;i< soundNames.length;i++){
		var audio = new Audio('sounds/'+soundNames[i]);
		audio.volume = soundVolumes[i];
		soundObjects.push(audio);
	}
	newRound.soundObjects = soundObjects;
	newRound.speed = speed;
	allRounds.push(newRound);
}
function createTurns(){
	createTurn("normalTurn",0.9, "vib1","#C0B9DD", "noSound");
	createTurn("ghostTurn",0.9, "vib1","#A9C5A0", "ghost.mp3");
}
function createTurn(type, displayTime,vibCode, color, soundName){
	var newTurn = [];
	newTurn.type = type;
	newTurn.displayTime = displayTime;
	newTurn.vibCode = vibCode;
	newTurn.hasSound;
	newTurn.soundObject;
	if(soundName=="noSound"){
		
		newTurn.hasSound = false;
	}else{
		var audio = new Audio('sounds/'+soundName);
		
		newTurn.hasSound = true;
		newTurn.soundObject = audio;
		
	}
	newTurn.color = color;
	allTurns.push(newTurn);
}

function newRound(roundNumber){
	var currentRound = allRounds[roundNumber];
	console.log("-------------currentRound--------");
	console.log(currentRound);
	turnNumber = 0; 
	send("startRound", roundNumber);
	turnInterval = setInterval(function(){
		send("yourTurn", currentRound.turns[turnNumber], players[playerTurn].id);
		currentTurnType = currentRound.turns[turnNumber];
		//console.log("currentTurnType "+currentTurnType);
		hostHandleTurn(currentTurnType, playerTurn);
		playCurrentSound(turnNumber,roundNumber);
		turnNumber++;
		if(turnNumber==currentRound.turns.length){
			endRound();	
		}
		playerTurn++;
		if(playerTurn>players.length-1){
			playerTurn=0;
		} 

	}, currentRound.speed);
}
function endRound(){
	clearInterval(turnInterval);
	console.log("Round over");
	turnNumber = 0; 
}
function getTurnByType(type){
	for(var i = 0; i<allTurns.length; i++){
		if(allTurns[i].type==type){
			return allTurns[i];
		}
	}
	return "notFound";
}
//-------------------------------------------------Game mechanics----------------------------------------------------------------------------------------------------------------------------------------------
function buttonClick(){
	send("buttonClick");	
}
function handleTurn(turnType){
	var turn = getTurnByType(turnType);
	var timeShown = allRounds[currentRoundNumber].speed*turn.displayTime;
	 $( "#gameContainer" ).animate({backgroundColor:turn.color}, timeShown*0.2 );
	initVibrate(turn.vibCode)
	setTimeout(function(){
		$( "#gameContainer" ).animate({backgroundColor: "rgba(200,100,100,0)"}, timeShown*0.1 );
	},timeShown);
}
function playCurrentSound(currentTurnNumber,roundNumber){
	var currentRound = allRounds[roundNumber];
	//console.log("playCurrentSound-----------------------------------------");
	for(var i = 0;i<currentRound.soundPositions.length; i++){
		if(currentTurnNumber== currentRound.soundPositions[i]){
			currentRound.soundObjects[i].play();
			//console.log(playSound+"-----------------------------------------");
		}
	}
	
}

var waitingForClick = false;
var responsiblePlayer = 0;
function hostHandleTurn(turnType, currentPlayerTurn){
	responsiblePlayer = currentPlayerTurn;
	var theTurn = getTurnByType(turnType);
	if(theTurn.hasSound){
		theTurn.soundObject.play();
	}
	if(turnType=="ghostTurn"){
		waitingForClick = true;
	}else{
		waitingForClick = false;
	}
}
function hostHandleButtonClick(playerID){
	var clickPlayer = findPlayerById(playerID);
	console.log(clickPlayer.name +" clicked");
	if(waitingForClick){
		if(clickPlayer.arrayPos ==  responsiblePlayer){
			console.log("Well Done");
		}else{
			console.log("It was a ghost but not your turn");
			endRound();
		}
		
	}else{
		console.log("Someone Clicked Wrongly");
		endRound();
	}
}

function updateGameInfo(text){
	document.getElementById("info").innerHTML = text;
}
function reloadPage(){
	window.location.reload();
}
//------------------------------------------------Vibrate----------------------------------------------------------------------------------------------------------------------------------------------
function initVibrate(libraryKey){
	vibrateCode(vibrationLibrary[libraryKey][0],vibrationLibrary[libraryKey][1],0);
}
function vibrateCode(code, wait, i){
		navigator.vibrate(code[i]);
		var j = 0;
		if(wait.length>1){
			j = i;
		}
		setTimeout(function(){
			if((i)<code.length-1){
				vibrateCode(code,wait,(i+1));
			}
		}, wait[j]);
}
		
//------------------------------------------------Draw----------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------SendFunction for player code----------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------Jquery----------------------------------------------------------------------------------------------------------------------------------------------

function jQueryInits(){
	$( "#menuContainer" ).click(function( event ) {
		event.stopPropagation();
		// Do something
	});
	$("#cheatsCheck").click(function() {
        if($(this).is(":checked")){
			enableCheats()
		}else{
			disableCheats();
		}
    });
	$(window).resize(function () {

	});

	$('.scoreText').change(function() { 
		insertCheatScore();
	});	
$('.no-zoom').bind('touchend', function(e) {
	  e.preventDefault();
	  // Add your code here. 
	  $(this).click();
	  // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
	})
	

}



//-------------------------------------------------Menu stuff-----------------------------------------------------------------------------------------------------------------------------------------------
function insertCheatScore(){
	//console.log("insertCheatScore()");
	for(var i =0; i<players.length; i++){
		$("#player"+(i+1)).addClass("playerInfo");
		if(players[i].active){
			players[i].score = parseInt(document.getElementById("scoreTextPlayer"+(i+1)).value);
		}
	}
}
function enableCheats(){
	cheatsOn = true;
	$(".scoreText").prop('readonly', false);
}
function disableCheats(){
	cheatsOn = false;
	$(".scoreText").prop('readonly', true);
}
function toggleMenu(){
//	console.log("toggleMenu");
	if($("#menubackground").is(':visible')){
		$("#menubackground").fadeOut("fast");
	}else{
		$("#menubackground").fadeIn("fast");
	}
	
}
function hideMenu(){
	$("#menubackground").fadeOut("fast");
}




//-------------------------------------------------Test functions----------------------------------------------------------------------------------------------------------------------------------------------
function testDraw(){
	//toggleMenu();
	var message = "00340150";
	//console.log(message.length);
	doSocketMessage(message);
}
function testplayerJoin(playerId){
	//toggleMenu();
	var message = {
      intent: "iAmReady",
	  value: "",
	  value2: playerNumber,
	  sender: "host",
	  playerNumber: playerId
    };
	handleInput(message);
}
function removeAllRooms(){

 send("serverTalk", "resetRooms");
}