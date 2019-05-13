var dgram = require('dgram');
var net = require('net');
var moment = require('moment');
var socket = dgram.createSocket('udp4');

var musicians = [];

//----------------------Protocol-------------------------------//
const MAX_DELAY = 5000;
const MULTICAST_ADDRESS = "239.240.241.255";
const PORT = 2205;

//var protocol = require('./protocol');


//----------------------TCP server----------------------------//
var tcpServer = net.createServer();
tcpServer.listen(PORT);
console.log("TCP Server now running on port : " + PORT);

tcpServer.on('connection', function (socket) {
    checkInstruments();
    socket.write(JSON.stringify(musicians));
    socket.destroy();
});


//--------------------------Socket-----------------------------//
// Activate multicast
socket.bind(PORT, function () {
    console.log("Multicast active --- address: " + MULTICAST_ADDRESS + " ,port:" + PORT);
    socket.addMembership(MULTICAST_ADDRESS);
});

// Event activated when received a message
socket.on('message', function(msg, src) {  
console.log('New message received' + msg);
   
   var parsedMsg = JSON.parse(msg);

    for (var musician = 0; musician < musicians.length; i++) {
        if (parsedMsg.uuid == musicians[musician].uuid) {
            musicians[musician].activeSince = parsedMsg.activeSince;
            return;
        }
    }
    musicians.push(parsedMsg);
});

//------------------------Functions-----------------------------//
//delete musician if he doesn't play until some seconds (MAX_DELAY)
function checkInstruments() {
    for (var musician = 0; musician < musicians.length; musician++) {
        if (moment().diff(musicians[musician].activeSince) > MAX_DELAY) {
            console.log('Mucisian removed : ' + JSON.stringify(musicians[musician]));
            musicians.splice(musician, 1);
        }
    }
}