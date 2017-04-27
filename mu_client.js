/*
 * 
 * IDC!
 */
//process.on('uncaughtException', function (err) {});
var WebSocket = require("ws");
var httpsagent = require("https-proxy-agent");

var request = require('request');


var packets = {

    cellcraft: {

        init: new Uint8Array([255, 50, 137, 112, 79]),
        init2: new Uint8Array([42]),
        init_last: new Uint8Array([90, 51, 24, 34, 131])
    },
    galx: {

        init: new Uint8Array([254, 5, 0, 0, 0]),
        init2: new Uint8Array([255, 50, 137, 112, 79]),
        init_last: new Uint8Array([90, 51, 24, 34, 131])
    },

    mgar: {

        init: new Uint8Array([254, 5, 0, 0, 0]),
        init2: new Uint8Array([255, 109, 103, 97, 114])
    },

    rata: {

        init: new Uint8Array([254, 0, 0, 0, 0]),
        init2: new Uint8Array([255, 0, 0, 0, 0])
    }
};

global.spawn_interval = function() {

    return Math.floor(Math.random() * (2000 - 750 + 1)) + 750;
}

module.exports = class Client {

    constructor(id, proxy, origin) {

        var me = this;

        me.id = id ? id : Math.floor(Math.random() * 1000);
        me.name = ";l3mpik |" + id;

        me.proxy = proxy;

        me.ws = null;

        me.agent = new httpsagent("http://" + me.proxy);

        me.canSpawn = false;
        me.close = false;

        me.origin = origin ? origin : null;

        me.ping_s = null;
        me.ping_e = null;

        me.cookie = "";

        me.headers = {

            'Origin': me.origin,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.89 Safari/537.35',
        };

        me.c_headers = {

            'Origin': me.origin.toString(),
            'Accept-Language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.89 Safari/537.35',
            'Accept-Encoding': 'gzip, deflate, sdch'
        };

        if (me.origin === "http://mgar.io") {

            me.getCookie();
            me.headers = me.c_headers;
        }


        if (me.origin === "http://nbk.io") {

            me.getCookie();
            me.headers = me.c_headers;
        }

    }

    connect(ip) {

        var me = this;

        me.ws = null;

        if (me.origin != null) {

            me.ws = null;

            me.ws = new WebSocket(ip, {
                protocolVersion: 13,
                agent: me.agent,
                origin: me.origin,
                headers: me.headers
            });
        }

        me.ws.datatype = "ArrayBuffer";

        me.ws.onopen = function() {

            if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {

                return;
            }

            if (me.origin === "http://galx.io") {

                me.ws.send(packets.galx.init);
                me.ws.send(packets.galx.ini2);

                me.ws.send(new Uint8Array([43]));
                me.ws.send(new Uint8Array([43]));
                me.ws.send(new Uint8Array([46]));
                me.ws.send(new Uint8Array([45]));

                me.ws.send(packets.galx.init_last);
            }

            if (me.origin === "http://cellcraft.io") {

                me.ws.send(packets.cellcraft.init);

                me.ws.send(packets.cellcraft.init2);


            }

            if (me.origin === "http://mgar.io") {

                me.ws.send(packets.mgar.init);
                me.ws.send(packets.mgar.init2);

            }

            if (me.origin === "http://rata.io") {

                me.ws.send(packets.rata.init);
                me.ws.send(packets.rata.init2);

                setInterval(me.rata_ping, 500);
            }
            var buf = new Buffer(5);
            buf.writeUInt8(254, 0);
            buf.writeUInt32LE(5, 1);

            me.ws.send(buf);

            var buf = new Buffer(5);
            buf.writeUInt8(255, 0);
            buf.writeUInt32LE(154669603, 1);
            me.ws.send(buf);

            var interval = global.spawn_interval();
            setInterval(function() {

                me.spawn(me.name);
            }.bind(me), 1000);
        }

        me.ws.onclose = function(e) {

            me.close = true;
            //console.log("Socket klosed :D", e.reason);
        }


        me.ws.onerror = function(e) {

            //console.log("Socket ełłoł :[");
            //me.close = true;
        }

        me.ws.on("error", () => {})

    }

    spawn(name) {

        var me = this;

        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {

            me.canSpawn = false;
            return;
        }

        if (me.origin === "http://cellcraft.io") {

            me.ws.send(packets.cellcraft.init2);
        }

        if (me.origin === "http://galx.io") {

            var b = new Uint8Array([42]);
            me.ws.send(b);
            var b = new Uint8Array([43]);
            me.ws.send(b);
            var b = new Uint8Array([43]);
            me.ws.send(b);
            var b = new Uint8Array([2]);
            me.ws.send(b);
            var b = new Uint8Array([46]);
            me.ws.send(b);
        }


        var buf = new Buffer(1 + 2 * name.length);
        buf.writeUInt16LE(0, 0);
        for (var i = 0; i < name.length; i++) {
            buf.writeUInt16LE(name.charCodeAt(i), 1 + i * 2);
        }

        me.ws.send(buf)

        if (me.origin === "http://cellcraft.io") {

            me.ws.send(packets.cellcraft.init_last);
        }

        me.canSpawn = true;

        //me.sendChat("TEST!BOTS! ")
        // me.split();
        // me.split();
    }

    moveTo(data) {

        var me = this;
        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        var x = data.x,
            y = data.y;


        var buf = new Buffer(13);
        buf.writeUInt8(16, 0);
        buf.writeInt32LE(x, 1);
        buf.writeInt32LE(y, 5);
        buf.writeUInt32LE(0, 9);
        me.ws.send(buf);


    }

    split() {

        var me = this;

        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        var buf = new Buffer([17]);

        me.ws.send(buf);

        if (me.origin === "http://mgar.io") {

            var buf = new Buffer([56]);
            me.ws.send(buf);
        }

    }

    sendChat(data) {

        var me = this;

        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {
            return;
        }

        var buf = new Buffer(2 + 2 * data.length);
        buf.writeUInt16LE(99, 0);
        for (var i = 0; i < data.length; i++) {
            buf.writeUInt16LE(data.charCodeAt(i), 2 + i * 2);
        }
        me.ws.send(buf)

    }

    eject() {

        var me = this;

        if (!me.ws || me.ws.readyState !== WebSocket.OPEN) {

            return;
        }
        var buf = new Buffer([22]);

        me.ws.send(buf);

        if (me.origin === "http://mgar.io") {

            var buf = new Buffer([57]);
            me.ws.send(buf);
        }
    }

    getCookie(data) {

        var me = this;

        request({
                url: me.origin,
                agent: me.agent,
                headers: {
                    'Accept-': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)  Chrome/55.0.2883.89 Safari/537.35',
                    'Accept-Encoding': 'gzip, deflate, sdch'
                }

            },
            function(error, response, body) {

                if (!error && response.headers["set-cookie"]) {

                    me.headers['cookie'] = response.headers["set-cookie"];
                }
            });
    }
};