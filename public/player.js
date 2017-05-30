var roomID = -1;

var role = "player";
var playerNumber;
var started = false;
var canvas;
var ctx;
var canvasWidth;
var canvasHeight;
var drawColor;
var lastX;
var lastY;
var currX =300;
var currY =500;
var flag = false;
var diffY;
var historyState = 0;
var imgHistory  = [];
var availableRedos;
var howMuchRedo = 30;
var paletteColor = "white"
var androidOffset = false;
var roomID = -1;
var finishedLoaded = false;

function onload(){
	var url = window.location.href;
	playerNumber = url.split("#")[1];
	console.log(playerNumber);
	
	console.log(window.location.host);
	playerNumber--;
	document.getElementById("playerNumber").innerHTML = ("Player: "+(playerNumber+1));
	if(playerNumber==0){
		document.getElementById("player1Stuff").style.display = "inline";
	}
	
	resetVariables();
	initCanvasVariables();
	initJquery();
	initCommonJquery();
	
	//document.body.requestFullscreen();
	window.scrollTo(0,100);
	console.log("canvasWidth "+canvasWidth);
	console.log("canvasHeight "+canvasHeight);
	console.log("window.innerHeight "+window.innerHeight);
	console.log("screen.height "+screen.height);
	console.log("$('#theCanvas').height()"+$("#theCanvas").height());
	updateDiffY();
	
	startConnection();
	if(window.location.host=="localhost:4330"){
		continueOnload();
		continueOnload2();
	}
	//draw();
	
}
function continueOnload(){
	//$("#sent").hide();
	console.log("continueOnload");
	
	clearCanvas();
	 $(function() {
		$.getJSON("https://api.ipify.org?format=jsonp&callback=?",
		  function(json) {
			console.log("My public IP address is: ", json.ip);
			send("serverTalk", "IP", json.ip);
			//joinByID(30);
		  }
		);
	  });
	  
	//send("userCanvas", canvasWidth, canvasHeight);
	//clearCanvas();
	//waitForOthers();
}

function continueOnload2(){
	$("#joiningDiv").hide();
	//requestLoginID();
	console.log("continueOnload2");
	console.log("Connected to room id "+roomID);
	iAmReady();
	finishedLoaded =true;
}
function requestLoginID(){
	$("#joinButtons").show();
	printJoinText("Enter the hosts login id. <br> <br>Failed to connect to game based on WIFI.");
}
function printJoinText(text){
	document.getElementById("joinText").innerHTML = text;
}
function joinByID(id){
	if(id=="input"){
		id = document.getElementById("joinID").value;
	}
	console.log("trying to join room with ID "+id);
	printJoinText("Connecting...");
	send("serverTalk", "ID", id);
}	

//------------------------------------------------handleInput----------------------------------------------------------------------------------------------------------------------------------------------
function iAmReady(){
	console.log("iAmReady: " +playerNumber);
	send("iAmReady");
}
function handleServerTalk(intent, data, data2){
	console.log("server wants "+ intent);
	console.log("data "+data);
	console.log("data2 "+data2);
	if(finishedLoaded){
		console.log("I am loaded");
		if(intent=="addedToRoom"){
			console.log("reconnecting to host");
			send("reconnect");
		}
	}else{
		if(intent=="addedToRoom"){
			roomID = data;
			var isNewRoom = data2;
			if(isNewRoom){
				requestLoginID();
			}else{
				continueOnload2();
			}
			
		}
		if(intent=="noSuchID"){
			console.log("Room Not Found");
			var joinID = data;
			printJoinText("Failed to join with ID "+joinID);
		}
	}
	
}


function handleInput(data){
	var intent = data.intent;
	if(intent=="serverTalk"){
		console.log("serverTalk");
		handleServerTalk(data.value, data.value2, data.value3);
	}
	if(intent=="hostLoaded" && playerNumber != null){
		started = false;
		console.log("host loaded");
		iAmReady();
	}
	if(intent=="canvasSize"){
		canvasSize = data.value;
		canvasHeight = data.value2;
		updateCanvasVariables();
	}
	if(intent=="startTurn"){
		if(playerNumber==data.value){
			startTurn(data.value2);
			console.log("start");
		}else{
			showGuessing();
		}
	}
	if(intent=="correct"){
		if(yourTurn){
			showInfo("Player "+ (data.value+1) +" guessed your drawing.");
			yourTurn = false;
		}else{
			if(playerNumber==data.value){
				showInfo("Congratulations. You got it right!");
			}else{
				showInfo("Sorry. Time is up! Player "+ (data.value+1) +" got it right.");
			}
		} 
		
	}
	if(intent=="incorrect"){
		if(playerNumber==data.value){	
			showWrong();
		}
	}
}

function initReconnect(){
	toggleMenu();
	reconnect();
}
function handleReconnect(){
	console.log("handleReconnect");
	joinByID(roomID);
	//send("reconnect");
	//
}
//------------------------------------------------Canvas and other varibales----------------------------------------------------------------------------------------------------------------------------------------------
function resetVariables(){
	lastX = 0;
	lastY = 0;
	lineWidth =5;
	drawColor = "black";
	players = [];
	historyState = 0;
	imgHistory  = [];
	createHistoryArray();
}
function changeDrawSize(width){
	if(width==5){
		lineWidth= Math.ceil(lineWidth*1.3)+1;
	}
	if(width==1){
		lineWidth= Math.floor(lineWidth*0.75);
	}
	console.log("changeDrawSize");
	
	//lineWidth= width;
	ctx.lineWidth=lineWidth;
	send("changeDrawSize",lineWidth );
}
function updateCanvasSize(){
	canvasWidth = document.documentElement.clientWidth;
	canvasHeight = document.documentElement.clientHeight;
	//canvasWidth = screen.width;
	//canvasHeight = screen.height;
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;
}

function updateDiffY(){
	diffY = 0;
	if(androidOffset){
		var totalDiff = canvasHeight-currY;
		var relation = 1-(totalDiff/canvasHeight);
		var maxChange = 80;
		var val = "";
		diffY = Math.floor(relation*maxChange);
	//	console.log("currY "+currY);
	//	console.log("diffY "+diffY);
		//val += relation +"relation y" +parseInt(currY) +" "+canvasHeight+"H W"+canvasWidth+ " diffY "+ diffY;
		//document.getElementById("playerNumber").innerHTML = ""+val;
	}
}

function setTextColor(picker) {
		//document.getElementsByTagName('body')[0].style.color = '#' + picker.toString()
		var newColor = '#' + picker.toString();
		paletteColor = newColor;
		//console.log(newColor);
		changeDrawColor(newColor);
	}
function changeColorToPalette(){
	changeDrawColor(paletteColor);

}
function changeDrawColor(color){
	//console.log("changeDrawColor");
	//console.log(theButton);
	drawColor = color;
	//drawColor= $("."+color).css("background-color");
	//console.log(drawColor);
	ctx.strokeStyle = drawColor;
	ctx.fillStyle = drawColor;
	//console.log(ctx.fillStyle );
	send("changeDrawColor",drawColor );
}
function clearCanvas(type){
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = drawColor;
	send("clear");
	if(type!="dontlog"){
		updateHistory();
	}
	
}
function fillCanvas(){
	ctx.fillRect(0, 0, canvasWidth, canvasHeight); // clear canvas
	send("fill", drawColor);
	changeDrawColor("black")
	//ctx.strokeStyle = "black";
	updateHistory();
}

//------------------------------------------------Draw----------------------------------------------------------------------------------------------------------------------------------------------
var drawDots = [];
var drawDotsMemory = 30;
function updateDrawDots(newX,newY){
	var newDot = []
	newDot.x = newX;
	newDot.y = newY;
	drawDots.push(newDot);
	if(drawDots.length>drawDotsMemory){
		drawDots.splice(0,1);
	}
}

function draw(){
	ctx.beginPath();
	//updateDrawDots(lastX, lastY);
	updateDrawDots(currX, currY);
	ctx.moveTo(drawDots[0].x,drawDots[0].y);
	for(var i =0; i<drawDots.length;i++){
		ctx.lineTo(drawDots[i].x,drawDots[i].y);
	}
	ctx.stroke();
	lastX = currX;
	lastY = currY;

}

function findxy(res, e) {
        if (res == 'down') {
			//document.getElementById("playerNumber").innerHTML = ("Player: "+(canvas.offsetTop));
			// updateHistory();
		//	console.log("down");
			currY = e.pageY - canvas.offsetTop;
			updateDiffY();
			//diffY=0;
            currX = e.pageX - canvas.offsetLeft;
            currY = e.pageY - canvas.offsetTop-diffY;
			lastX = currX;
			lastY = currY;
            flag = true;
			var value = addZeroes(parseInt(currX))+""+addZeroes(parseInt(currY));
			//console.log(currX +"<x y>" +currY +" "+canvasHeight+"<H W>"+canvasWidth);
			send("start", value);
			
			sendCurrentXY();
			
        }
        if (res == 'up' || res == "out") {
			//updateHistory();
            flag = false;
			drawDots = [];
			send("stop");
			updateHistory();
			clearFutureHistory();
			var val = "";
			send("userCanvas", canvasWidth, canvasHeight);
			//val += parseInt(currX) +"x y" +parseInt(currY) +" "+canvasHeight+"H W"+canvasWidth;
			//document.getElementById("playerNumber").innerHTML = ""+val;
        }
        if (res == 'move') {
            if (flag) {
			//	console.log("move");
				updateDiffY();
                currX = e.pageX - canvas.offsetLeft;
                currY = e.pageY - canvas.offsetTop-diffY;
				sendCurrentXY();
            }
        }
    }

function sendCurrentXY(){
	var value = addZeroes(parseInt(currX))+""+addZeroes(parseInt(currY));
	send("DrawMessage", value);
	//console.log(value);
	draw();
}
function addZeroes (str) {
  str = str.toString();
  return str.length < 4 ? addZeroes("0" + str, 4) : str;
}	
function handleDrawMessage(message){
	//currX = parseInt(message.substring(0, 4));
	//currY = parseInt(message.substring(4, 8));
	//draw();
}
//------------------------------------------------Undo Redo----------------------------------------------------------------------------------------------------------------------------------------------



function createHistoryArray(){
	for(var i =0; i<howMuchRedo; i++){
		var newImgObj = "not used";
		imgHistory.push(newImgObj);
	}
	availableRedos = imgHistory.length;
}
function clearFutureHistory(){
	for(var i =(historyState+1); i<imgHistory.length; i++){
		imgHistory[i] =  "not used";
	}
}
function getHistoryState(upOrDown){
	var historyStateTemp = historyState;
	if(upOrDown=="up"){
		historyStateTemp++;
		if(historyStateTemp==availableRedos){
			historyStateTemp=0;
		}
	}
	if(upOrDown=="down"){
		historyStateTemp--;
		if(historyStateTemp==-1){
			historyStateTemp=availableRedos-1;
		}
	}
	return historyStateTemp;
}
function updateHistory(){
	historyState = getHistoryState("up");
	imgHistory[historyState] =canvas.toDataURL();
	//console.log(imgHistory);
}
function undo(){
	historyState = getHistoryState("down");
	updateToCurrentState("up");
}
function redo(){
	historyState = getHistoryState("up");
	updateToCurrentState("down");
}
function updateToCurrentState(oppositeDirection){
	//console.log("historyState "+historyState);
	if( imgHistory[historyState]=="not used"){
		console.log("no more undo/redo states");
		historyState = getHistoryState(oppositeDirection);
	}else{
		var oldImgData = imgHistory[historyState];
		clearCanvas("dontlog");
		drawImgData(oldImgData);
		send("drawImgData", oldImgData);
	}
	
}
function drawImgData(imgData){
	var img = new Image();
	img.src = imgData;
	img.onload = function() {
		ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	};
}
function syncWithHost(){
	clearCanvas();
	send("userCanvas", canvasWidth, canvasHeight);
	send("changeDrawColor",drawColor );
	send("changeDrawSize", lineWidth);
}
//------------------------------------------------Turn Stuff----------------------------------------------------------------------------------------------------------------------------------------------
var yourWord ="";
var yourTurn = false;
function startTurn(word){
	$("#inputContainer").show();
	$("#whatsMyWordButton").show();
	$("#waitingDiv").hide();
	$("#guessContainer").hide();
	yourTurn = true;
	syncWithHost();
	if(word==yourWord){
		console.log("I know");
	}else{
		yourWord = word;
		whatsMyWord();
	}
}
function showGuessing(){
	yourTurn = false;
	$("#inputContainer").hide();
	$("#whatsMyWordButton").hide();
	document.getElementById("guessText").value = "";
	$("#guessText").attr("placeholder", "Write your guess here");
	$("#waitingDiv").hide();
	$("#guessContainer").show();
}
function whatsMyWord(){
	document.getElementById("yourWord").innerHTML = "Your word is: "+ yourWord;
	document.getElementById("whatsMyWordButton").value = "Your word is: "+ yourWord;
	$("#yourWord").show();
	$("#yourWord").fadeOut(5000);
	//alert("your word is "+ yourWord);
}
function guess(){
	var guess = document.getElementById("guessText").value;
	send("guess", guess);
}
function showInfo(text){
	document.getElementById("waitingDiv").innerHTML = text;
	$("#inputContainer").hide();
	$("#whatsMyWordButton").hide();
	$("#waitingDiv").show();
	$("#guessContainer").hide();
}
function showWrong(){
	document.getElementById("guessText").value = "";
	$("#guessText").attr("placeholder", "Wrong");
}
function sendStart(){
	send("startGame");
}
function getNewWord(){
	send("getNewCard");
}


//------------------------------------------------Jquery inits----------------------------------------------------------------------------------------------------------------------------------------------
var stepValue = 0;
function initJquery(){
	$('.no-zoom').bind('touchend', function(e) {
	  e.preventDefault();
	  // Add your code here. 
	  $(this).click();
	  // This line still calls the standard click event, in case the user needs to interact with the element that is being clicked on, but still avoids zooming in cases of double clicking.
	})

	$('#sound').click(function(event){
		event.stopPropagation();
		toggleMenu();
	});
	$("#androidOffset").click(function() {
        if($(this).is(":checked")){
			androidOffset = true;
		}else{
			androidOffset = false;
		}
    });
	$( window ).scroll(function() {
		  updateCanvasSize();
		  if( yourTurn){
			send("userCanvas", canvasWidth, canvasHeight);
		  }
		  updateToCurrentState("up");
		});
	canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
		canvas.addEventListener("touchmove", function (e) {
			findxy('move', e.touches[0])
        }, false);
        canvas.addEventListener("touchstart", function (e) {
			//console.log(e);
			e.preventDefault();
			//document.getElementById("playerNumber").innerHTML = canvas.offsetTop;
		//	var values= "diffY " +diffY+ " canvasHeight" + canvasHeight;
			//	document.getElementById("playerNumber").innerHTML = values;
            findxy('down', e.touches[0])
        }, false);
		canvas.addEventListener("touchend", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("touchcancel", function (e) {
            findxy('out', e)
        }, false);
	$( "#menuContainer" ).click(function( event ) {
		event.stopPropagation();
		// Do something
	});
		$(window).resize(function () {
		updateCanvasSize();
		updateDiffY();
		updateHideDivSize();
		 if( yourTurn){
			send("userCanvas", canvasWidth, canvasHeight);
		  }
		  updateToCurrentState("up");
		  updateCanvasVariables();
		//send("canvasSize", canvasWidth, canvasHeight);
	});
}
/* $(window).load(function() {
  $("html, body").animate({ scrollTop: $(document).height() }, 1);
});
 */

 function updateHideDivSize(){
	document.getElementById("rotate").style.height = "100vh";
	document.getElementById("rotate").style.width = "100vw";
 }
 
function toggleMenu(){
		$("#nav-icon3").toggleClass('open');
		//console.log("menu");
		if($("#menu").is(":visible")){
			$("#menu").slideUp(200);
		}else{
			$("#menu").slideDown(200);
		}
}
function toggleSideMenu(){
		//$("#nav-icon3").toggleClass('open');
		//console.log("sideMenu");
		if($("#sideMenu").is(":visible")){
			$("#sideMenu").hide(200);
			window.setTimeout(function() {
				$("#sideHide").val("Show Toolbar");
			}, 200);
		}else{
			$("#sideMenu").show(200);
			window.setTimeout(function() {
				$("#sideHide").val("Hide Toolbar");
			}, 200);
			
		}
}
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}
//--------------------------------------------Test-------------------------------------

function testStart(){
	toggleMenu();
	var message = {
      intent: "startTurn",
	  value: 0,
	  value2: "apple",
	  sender: "host",
	  playerNumber: 1
    };
	handleInput(message);
}
function testStart2(){
	toggleMenu();
	var message = {
      intent: "startTurn",
	  value: 1,
	  value2: "apple",
	  sender: "host",
	  playerNumber: 1
    };
	handleInput(message);
}




