var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);


//======================================
var colors = require('colors');
var fs = require('fs');

//======================================
var user = require("./user.js");

global.server = {

    port: 997,
    useBan: true
};

global.banned = fs.readFileSync('banned.txt').toString().split("\n");

var users = [];

io.on('connection', function (socket) {

    var ip = socket.request.connection.remoteAddress.split("ffff:")[1];

   for(var i = 0; i < global.banned.length; i++){

        if (ip === global.banned[i]) {

            socket.disconnect("User Banned!", ip);
        }
    }

    socket.emit('request_uuid', 'null here bro');

    socket.on('request_uuid', function (data) {

        if (data === "" || data === null || data === void(0)) {

            socket.disconnect("Empty uuid :/");
        } else {

            socket.room = data;
            socket.join(socket.room);
        }
        
        console.log("[SERVER] User connected with IP [ " + ip + " ]\n");
        
        users.push(new user(socket.room));

        console.log("[SERVER] Users: " + users.length);
    });


    socket.on('data', function(data){

        for(var i = 0; i < users.length; i++){
            var user = users[i];

            if(user.uuid === socket.room){

                user.setData(data, ip);
                io.to(socket.room).emit("info", user.getStatus());
            }
        }
    });

    socket.on('action', function(data){

        for(var i = 0; i < users.length; i++){
            var user = users[i];

            if(user.uuid === socket.room){

                if(data === "split") user.botSplit();

                if(data === "eject") user.botEject();

                if(data === "rage")  user.botRage();
            }
        }
    });


    socket.on('disconnect', function(){

        console.log("[SERVER] User : " + socket.room , " Disconnected!\n");

        for(var i = 0; i < users.length; i++){
            var user = users[i];

            if(user.uuid === socket.room){

                user.destroy();
                users.splice(users[i], 1);
                console.log("[SERVER] Users: " + users.length, users);
            }
        }
    });


});

http.listen(global.server.port, function () {

    console.log(
            "[SERVER] FeedBot 3.0\n".green,
            "[SERVER] PORT:", global.server.port + "\n",
            "[SERVER] Proxies:", global.proxies.length.toString().cyan,"\n",
            "[SERVER] Users: ", 0,
            "\n\n"
            );
});

