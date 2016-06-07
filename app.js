//Particle firmware Voodoo Spark
//https://raw.githubusercontent.com/voodootikigod/voodoospark/master/firmware/voodoospark.cpp
var five = require("johnny-five");
var Particle = require("particle-io");
var XboxController = require('xbox-controller');
var ready = false;
var servo;

//BOARD SETUP
var board = new five.Board({
	io: new Particle({
		token: process.env.TOKEN,
		deviceId: process.env.DEVICE_ID
	})
});

//CONTROLLER SETUP
var xbox = new XboxController(process.env.XBOX_SERIAL);

board.on("ready", function() {
	ready = true;
	servo = five.Servo({
		pin: 'A7',
		startAt: 45,
		centered: true,
		range: [0, 90]
	});
});

xbox.on('leftshoulder:press', function(){
	if(ready) {
		servo.min();
	}
});

xbox.on('rightshoulder:press', function(){
	if(ready) {
		servo.max();
	}
});

xbox.on('leftshoulder:release', function(){
	if(ready) {
		servo.to(45);
	}
});

xbox.on('rightshoulder:release', function(){
	if(ready) {
		servo.to(45);
	}
});

xbox.on('righttrigger', function(position) {
	if(ready) {
		console.log(servoLimit(position, 45));
		servo.to(servoLimit(position, 45));
	}
});

xbox.on('lefttrigger', function(position) {
	if(ready) {
		console.log(~(servoLimit(position, 0) - 45));
		servo.to(~(servoLimit(position, 0) - 45));
	}
});

xbox.on('left:move', function(position){
	if(ready) {
		if(position.y < 0) {
			position.y = ~position.y;
			board.analogWrite('D0', 0);
			board.analogWrite('D1', limit(position.y));
		}
		else {
			board.analogWrite('D1', 0);
			board.analogWrite('D0', limit(position.y));
		}
	}
});

xbox.on('right:move', function(position){
	if(ready) {
		if(position.y < 0) {
			position.y = ~position.y;
			board.analogWrite('D2', 0);
			board.analogWrite('D3', limit(position.y));
		}
		else {
			board.analogWrite('D3', 0);
			board.analogWrite('D2', limit(position.y));
		}
	}
});

xbox.on('connected', function(){
	console.log('Xbox controller connected');
});

xbox.on('not-found', function(){
	console.log('Xbox controller could not be found');
});

function limit(position) {
	return ~~(position * 2 / 256);
}

function servoLimit(position, min) {
	return ~~(position / 5.6 + min);
}
