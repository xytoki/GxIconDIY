var exporter="http://gxicon.e123.pw/api.php?icon/export";
var folder="app";

var fs = require('fs');
var path=require("path");
var wget = require('node-wget');
var request = require('request');
var drawable_folder=path.normalize(__dirname+"/../"+folder+"/src/main/res/drawable-nodpi");
var drawable_xml=path.normalize(__dirname+"/../"+folder+"/src/main/res/xml/drawable.xml");
var iconpack_xml=path.normalize(__dirname+"/../"+folder+"/src/main/res/values/icon_pack.xml");
console.log(drawable_folder);
console.log(drawable_xml);
console.log(iconpack_xml);
fs.mkdir(drawable_folder,function(){})
request(exporter, function (error, response, body) {
	if(error){
		throw error;
		process.exit(1);
	}
	var j=JSON.parse(body).icons;
	console.log("Ready to download...");
	var next=function(i,cb){ 
		if(typeof(j[i])=="undefined")return cb();
		var basefn=j[i][1].replace(new RegExp("\\.","g"),"_")+"_"+j[i][0];
		basefn=basefn.toLowerCase().replace(/ /g,"");
		var fn=drawable_folder+"/"+basefn+".png";
		wget({url: "http:"+j[i][2]+"!d192", dest: fn}, function(){
			//Write drawable.xml 
			var dx=fs.readFileSync(drawable_xml).toString().split("<!--AutoInjector End-->");
			fs.writeFileSync(drawable_xml,dx[0]+'	<item drawable="'+basefn+'" />\r\n	<!--AutoInjector End-->'+dx[1]);
			//Write icon_pack.xml
			var dx=fs.readFileSync(iconpack_xml).toString().split("<!--AutoInjector End-->");
			fs.writeFileSync(iconpack_xml,dx[0]+'	<item>'+basefn+'</item>\r\n	<!--AutoInjector End-->'+dx[1]);
			//Done
			console.log(fn);
			next(i+1,cb)
		});
	}
	next(0,function(){
	})
});