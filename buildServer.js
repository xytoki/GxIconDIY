const express = require('express');
const IO = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const queue = require('queue');
const fsex=require("fs-extra");
const http=require('http');

var q = queue();
q.autostart=true;
q.concurrency=1;
q.start();
var success_data={};

const app = express();
var server = http.createServer(app);
var io = IO(server);

server.listen(2019,function(){
    console.log('server is running at port 2019.');
});

app.all('*', function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("X-Powered-By",'GX');
    next();  
});  
