var Upyun = require('upyun-classic');
var u=process.env.UPY_STOR.split(",");
var Client = require('ftp');
var fs = require('fs');
var moment=require("moment");
var path=require("path");
var config=JSON.parse(fs.readFileSync("_autoMake.json"));
var remote=[
	'/apk/'+moment().format("YYYY/MM/")+config.pkg+"/",
	config.apk_file||(config.pkg+"_"+config.vname+".apk")
]
var c = new Client();
	c.on('ready', function() {
		c.mkdir(remote[0],true,function(err){
			if (err) throw err;
			c.put(__dirname+'/app/build/outputs/apk/gxIconDIY.signed.apk',remote.join(""), function(err) {
				if (err) throw err;
				c.end();
				console.log("DONE\r\n",remote.join(""));
			});
		});
});
c.connect({
	host:"v0.ftp.upyun.com",
	user:u[1]+"/"+u[0],
	password:u[2]
});