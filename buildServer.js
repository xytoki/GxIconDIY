const Koa = require('koa');
const cors = require('koa2-cors');
const kjson = require('koa-json')
const router = require('koa-router')();
const IO = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const queue = require('queue');
const fsex=require("fs-extra");
const http=require('http');
const log=require('npmlog');
const Git = require('simple-git/promise')();
const uuid=require("uuid/v4");

var q = queue();
q.autostart=true;
q.concurrency=1;
q.start();
q.current=false;
q.on("start",function(job){
    q.current=job;
});
q.on("success",function(){
    q.current=false;
});
q.on("error",function(){
    q.current=false;
});
var finishedJobs=[];

const app = new Koa();
app.use(cors());
app.use(kjson());
const server = http.Server(app.callback());
const io = IO(server);
var port=process.env.PORT || 5656;
server.listen(port, () => {
    log.info("WEB",`httpd started at ${port}`);
})
router.get('/api/build/:id', async (ctx, next) => {
    var localId=addJob({
        jobId:ctx.params.id
    });
    ctx.response.body = {
        code:0,
        data:{
            localId:localId,
            status:q.current._gx_info.localId==localId?"current":"pending",
            queueLength:q.jobs.length
        }
    }
});
router.get('/api/queue', async (ctx, next) => {
    var infos=[]
    for(var i of q.jobs){
        infos.push(i._gx_info);
    }
    ctx.response.body = {code:0,data:{
        status:q.jobs.length==0?"idle":"busy",
        queue:infos.reverse(),
        current:q.current._gx_info,
        finished:[].concat(finishedJobs).reverse().slice(0,10)
    }};
});
router.get('/', async (ctx, next) => {
    ctx.response.body = 'GxIcon BuildServer [beta]<br>Current pending jobs:<br>';
});
app.use(router.routes());
function addJob(data){
    data.localId=uuid();
    data.queueTime=new Date().getTime();
    var f=async function () {
        var data=arguments.callee._gx_info;
        data.execTime=new Date().getTime();
        await sleep(10000);
        data.endTime=new Date().getTime();
        finishedJobs.push(data);
        log.info("JOB","END",{localId:data.localId,jobId:data.jobId});
    };
    f._gx_info=data;
    log.info("JOB","ADD",{localId:data.localId,jobId:data.jobId});
    q.push(f);
    return data.localId;
}
async function sleep(usec){
    return new Promise(function(resolve){
        setTimeout(resolve,usec);
    });
}