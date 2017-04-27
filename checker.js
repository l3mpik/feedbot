//hahahha
process.setMaxListeners(0);
///process.on('uncaughtException', function(e){});

var httpsagent = require("https-proxy-agent");

var WebSocket = require('ws');
var Socks = require('socks')
var fs = require('fs');

global.working = 0;

fs.open("proxyw.txt", 'a', 666, function(e, id) {
    global.id = id;
});

var proxies = fs.readFileSync('proxy.txt').toString().split("\n");

class Checker {

    constructor(proxy) {

        this.proxies = proxy;

        this.servers = [

            "ws://45.32.186.119:4041",
            "ws://104.207.132.60:4041"

        ];

    }

    check_ws(ip) {

        var self = this;

        var ws = null;

        var start = null;
        var data = ip.split(":");
        var server = self.servers[Math.floor(Math.random() * self.servers.length)];

        ws = new WebSocket(server, {
            //     agent: new Socks.Agent({
            //     proxy: {
            //         ipaddress: data[0],
            //         port: parseInt(data[1]),
            //         type: parseInt(5)
            //     }
            // }),
            agent: new httpsagent("http://" + ip),
            origin: "http://cellcraft.io",
            headers: {
                'Origin': "http://cellcraft.io",
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.89 Safari/537.35',
            }
            //,timeout: 3000

        });

        ws.onopen = function() {

            ws.send(new Uint8Array([254, 5, 0, 0, 0]));
            ws.send(new Uint8Array([255, 50, 137, 112, 79]));
            ws.send(new Uint8Array([42]));
            ws.send(new Uint8Array([90, 51, 24, 34, 131]));


            setTimeout((() => {

                self.spawn(ws, ip);
            }).bind(self), 1000)
        }

        ws.onclose = function(e) {};

        ws.onerror = function(e) {
            ws.close();
        };


    }

    spawn(ws, ip) {

        var self = this;

        if (!ws || ws.readyState !== WebSocket.OPEN) {

            return;
        }


        var b = new Uint8Array([42]);
        ws.send(b);

        ws.send(new Uint8Array([0, 59, 0, 108, 0, 55, 0, 112, 0, 175, 0]));

        //    ws.send(new Uint8Array([99,0,108,0,51,0,109,0,112,0,105,0,107,0,89,0,84,0,32,0,98,0,111,0,116,0,115,0,32,0,103,0,105,0,118,0,101,0,97,0,119,0,97,0,121,0,33,0,32,0,58,0,41,0]))
        fs.write(global.id, ip + '\r\n', null, 'utf8', function() {
            global.working++;

            //            console.log("WORKING:", global.working);
            ws.close();
        });

        ws.close();
    }

    start() {

        var self = this;
        self.i = 0;

        function myLoop() {

            setTimeout(function() {
                console.log("LOL: " + self.i + " / " + self.proxies.length + " Working: " + global.working)
                self.i++;

                if (self.i < self.proxies.length) {

                    self.check_ws(self.proxies[self.i]);
                    myLoop();
                }
                if (self.i === self.proxies.length + 5000) {

                    process.exit();
                }
            }, 10);
        }

        myLoop();
    }


}


var test = new Checker(proxies);

test.start();