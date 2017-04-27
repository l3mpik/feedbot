var mu_client = require('./mu_client');

var WebSocket = require('ws');

var fs = require('fs');

global.proxies = fs.readFileSync('proxyw.txt').toString().split("\n");


global.maxBots = 1000;


module.exports = class User {

    constructor(uuid) {

        var me = this;

        me.uuid = uuid;

        me.status = {

            bot_a: null,
            bot_t: null,
            bot_s: null
        };

        me.mouse_x = null;
        me.mouse_y = null;

        me.server = null;
        me.origin = null;

        me.maxBots = global.maxBots;

        me.bots = [];

        me.time = 90000;
        me.time_interval = null;
    }

    setData(data, ip) {

        var me = this;

        if (me.server !== null && me.server !== data.server) {

            console.log("[USER] ", me.uuid + " Change Server: ", me.server)

            me.destroy();
            me.getBots();
        }

        me.mouse_x = data.mouse_x;
        me.mouse_y = data.mouse_y;

        me.origin = data.origin;
        me.server = data.server;

        me.botMove();

    }

    getStatus() {

        var me = this;

        me.status.bot_a = 0;
        for (var i in me.bots) {

            var bot = me.bots[i];

            if (bot.canSpawn == true && bot.close == false) {

                me.status.bot_a++;
            }
        }

        return me.status;
    }

    destroy() {

        var me = this;

        if (me.bots.length > 0) {

            for (var i in me.bots) {
                var bot = me.bots[i];
                if (bot !== null && bot !== void(0) && bot.ws && bot.ws.readyState === WebSocket.OPEN) {

                    bot.ws.close();
                }
            }
        }


        clearInterval(me.time_interval);
        clearTimeout(me.botLoop);
        me.bots = [];
    }

    startTime() {

        var me = this;

        if (me.time_interval === null) {

            me.time_interval = setInterval(function() {

                if (me.time > 0) me.time--;
                me.status.bot_t = me.time;

            }.bind(me), 1000);
        }
    }

    getBots() {

        var me = this;

        me.destroy();
        me.startTime();


        for (var b = 1; b < me.maxBots; b++) {

            me.bots.push(new mu_client(b, global.proxies[Math.floor(Math.random() * global.proxies.length)], me.origin));
            me.bots.push(new mu_client(b + 1, global.proxies[Math.floor(Math.random() * global.proxies.length)], me.origin));
        }

        var i = 1;

        function botLoop() {

            setTimeout(() => {

                if (me.time <= 0) {

                    me.destroy();
                }

                if (me.time > 0) {

                    me.status.bot_t = me.time;

                    if (me.bots[i] !== void(0)) {

                        if (me.bots[i].canSpawn === false || me.bots[i].close === true) {

                            me.bots[i].connect(me.server);
                        }

                        if (me.bots[i].close === true && me.bots[i].canSpawn === false) {

                            me.bots.splice(me.bots.indexOf(me.bots[i]), 1);

                        }


                        if (me.status.bot_a < me.maxBots) {

                            me.bots.push(new mu_client(i + 1, global.proxies[Math.floor(Math.random() * global.proxies.length)], me.origin));
                            me.bots.push(new mu_client(i + 2, global.proxies[Math.floor(Math.random() * global.proxies.length)], me.origin));
                        }

                    }
                }

                i++

                if (i >= me.bots.length) {
                    i = 0;
                }
                botLoop();

            }, 150);
        }

        botLoop();
    }

    botMove() {

        var me = this;

        for (var i in me.bots) {

            var bot = me.bots[i];

            bot.moveTo({
                x: me.mouse_x,
                y: me.mouse_y
            });
        }
    }

    botEject() {

        var me = this;

        for (var i in me.bots) {

            var bot = me.bots[i];

            bot.eject();
        }
    }

    botSplit() {

        var me = this;

        for (var i in me.bots) {

            var bot = me.bots[i];

            bot.split();
        }
    }

}