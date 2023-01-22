const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var ctrl = io.of('/control');

//MySQL Stuff
var mysql = require("mysql");
var con = mysql.createConnection({
	host: "localhost",
	user: "debian-sys-maint",
	password: "wjB0Rti8vMgmZhiu",
	database: "captions"
});

con.connect(function(err){
	if(err){
		console.log('Error connecting to Db');
		return;
	}
	console.log('Connection established');
});

//var tableData = '<table style="width:100%">'
var tableData = '';
var roseElfData = '';
var dogDaysData = '';
var testData = '';

var roseElfTitles = [];
var dogDaysTitles = [];
var testTitles = [];
var titles = [];

var masterIdx = 0;

con.query('SELECT * FROM Monteverdi',function(err,rows){
	if(err) throw err;
	console.log('Retrieving Monteverdi titles from Db...\n');

	for (var i = 0; i < rows.length; i++) {
//		console.log(rows[i].Measure + '\t' + rows[i].TitleText);
		roseElfData = roseElfData + '<tr>' + '<td style="width:10%">' + rows[i].Cue  + '</td>' +
			'<td style="width:90%">' + rows[i].TitleText + '</td>' + '</tr>'
		roseElfTitles[i] = rows[i].TitleText;
	};

	tableData = roseElfData;
	titles = roseElfTitles;
});

con.query('SELECT * FROM Beecher',function(err,rows){
	if(err) throw err;
	console.log('Retrieving Beecher titles from Db...\n');
	for (var i = 0; i < rows.length; i++) {
		dogDaysData = dogDaysData + '<tr>' + '<td style="width:10%">' + rows[i].Cue  + '</td>' +
			'<td style="width:90%">' + rows[i].TitleText + '</td>' + '</tr>'
		dogDaysTitles[i] = rows[i].TitleText;
	};
});

con.query('SELECT * FROM test',function(err,rows){
	if(err) throw err;
	console.log('Retrieving Test titles from MySQL database...\n');
	for (var i = 0; i < rows.length; i++) {
		testData = testData + '<tr>' + '<td style="width:10%">' + rows[i].Cue  + '</td>' +
			'<td style="width:90%">' + rows[i].TitleText + '</td>' + '</tr>'
		testTitles[i] = rows[i].TitleText;
	};
});

con.end(function(err) {
	// The connection is terminated gracefully
	//Ensures all previously enqueued queries are still before sending a COM_QUIT packet to the MySQL server.     
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/control', function(req, res){
	res.sendFile(__dirname + '/control.html');
});


app.get('/loaderio-92ffeb676f55d9bdc9403906f22d0089', function(req, res){
	res.sendFile(__dirname + '/token.txt');
});


io.on('connection', function(socket){
	console.log('User connected');

//  socket.on('chat message', function(msg){
//    console.log('message: ' + msg);
//    io.emit('chat message', msg);
//  });
	
	socket.on('refresh', function() {
		console.log('Refresh requested by: ' + socket.id);
		io.to(socket.id).emit('current title', titles[masterIdx]);
	});
});

ctrl.on('connection', function(socket){
	console.log('CONTROL user connected');

	socket.on('next', function(){
		masterIdx++;
		console.log('message: ' + titles[masterIdx]);
		io.emit('new title', titles[masterIdx]);

		ctrl.emit('next title', titles[masterIdx+1]);
		ctrl.emit('title number', masterIdx+1);
	});

	socket.on('black', function(){
		io.emit('new title', '');
	});
	
	socket.on('all', function() {
//		console.log('requesting all: '+tableData);
		ctrl.emit('all titles', tableData);
	});

	socket.on('control refresh', function() {			
		ctrl.emit('next title', titles[masterIdx+1]);
		ctrl.emit('title number', masterIdx+1);
	});
	
	socket.on('cue next', function(num) {
		masterIdx = num;
		ctrl.emit('next title', titles[masterIdx+1]);
//		ctrl.emit('title number', masterIdx+1);	
	});
	
	socket.on('switch work', function(operaName) {
		console.log('switching to: '+operaName);

		switch (operaName) {
			case 'Monteverdi':
				titles = roseElfTitles;
				tableData = roseElfData;
				break
			
			case 'Beecher':
				titles = dogDaysTitles;
				tableData = dogDaysData;
				break;

			case 'Test':
				titles = testTitles;
				tableData = testData;
				break;
		}
		
		masterIdx = 0;		
		ctrl.emit('all titles', tableData);
		ctrl.emit('next title', titles[masterIdx+1]);
		ctrl.emit('title number', masterIdx+1);			
	}); // End 'switch piece'
	
}); // End 'connection'


server.listen(4000, function(){
  console.log('listening on *:4000');
});
