const Koa = require('koa');
const IO = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const queue = require('queue');
const fsex=require("fs-extra");
const http=require('http');
const log=require('npmlog');

var q = queue();
q.autostart=true;
q.concurrency=1;
q.start();
var success_data={};

const app = new Koa();
const server = require('http').Server(app.callback());
const io = require('socket.io')(server);
var port=process.env.PORT || this.options.port || 3003;
server.listen(port, () => {
    log.info("WEB",`httpd started at ${port}`);
})
