var folder="app";
var exporter="http://gxicon.e123.pw/api.php?icon/export";
var w_pkg=process.argv[2];
var w_file=process.argv[3];

var fs = require('fs');
var path=require("path");
var log=require("npmlog");
var moment=require("moment");
var wget = require('node-wget');
var request = require('request');
var drawable_folder=path.normalize(__dirname+"/"+folder+"/src/main/res/drawable-nodpi");
var drawable_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/xml/drawable.xml");
var iconpack_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values/icon_pack.xml");
var appfilter_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/xml/appfilter.xml");
log.info("INFO","GxIcon Injector v1");
log.info("DIR",drawable_folder);
log.info("DIR",drawable_xml);
log.info("DIR",iconpack_xml);
log.info("DIR",appfilter_xml);
log.info("PKG",w_pkg);
log.info("ICO",w_file);

/* app名转drawable名，来自@by_syk的nanoiconpack服务端代码 */
function codeAppName(name) {
  if (!name) {
    return "";
  }
  name = name.trim();
  if (name.length == 0) {
    return "";
  }
  // 注意不是 /^[A-Za-z][A-Za-z\d'\+-\. _]*$/
  if (/^[A-Za-z][A-Za-z\d'\+\-\. _]*$/.test(name)) {
    var res;
    while ((res = /([a-z][A-Z])|([A-Za-z]\d)|(\d[A-Za-z])/.exec(name)) != null) {
      name = name.replace(res[0], res[0].charAt(0) + "_" + res[0].charAt(1));
    }
    return name.toLowerCase()
      .replace(/'/g, "")
      .replace(/\+/g, "_plus")
      .replace(/-|\.| /g, "_")
      .replace(/_{2,}/g, '_');
  }
  return "";
}
function generateCode(app) {
	if(typeof(app.launcher)=="undefined")return "";
	var code = "<!-- " + app.label + " / ";
	if (!app.labelEn||app.labelEn.trim().length == 0) {
		code += app.label + " -->";
	} else {
		code += app.labelEn + " -->";
	}
	code += "\n<item component=\"ComponentInfo{" + app.pkg.trim() + "/" + app.launcher
		+ "}\" drawable=\"";
	code += app.drawable + "\" />";
	return code;
}
/* 包名获取app名/drawable等，调用@by_syk的nanoiconpack接口 */
function getAppData(pname,cb){
	request("http://gxicon.e123.pw/api.php?nano/code/"+pname, function (error, response, body) {
		if(error){
			throw error;
			process.exit(1);
		}
		var j=JSON.parse(body).result;
		var theApp={};
		var theCount=-1;
		for(var i in j){
			if(j[i].sum>theCount){
				theApp=j[i];
				theCount=j[i].sum;
			}
		}
		theApp.pkg=theApp.pkg||pname;
		theApp.drawable=codeAppName(theApp.labelEn||theApp.label);
		if(theApp.drawable.trim()=="")theApp.drawable=codeAppName(theApp.pkg);
		theApp.code=generateCode(theApp);
		cb(theApp);
	});
}
/* Update icons */
fs.mkdir(drawable_folder,function(){})

var pname=w_pkg.replace(/ /g,"");
getAppData(pname,function(app){
	var basefn=app.drawable;
	
	var fn=drawable_folder+"/"+basefn+".png";
	fs.writeFileSync(fn,fs.readFileSync(w_file));
	log.info("PKG","Icon copied");
	
	//Write drawable.xml 
	var dx=fs.readFileSync(drawable_xml).toString().split("</resources>");
	fs.writeFileSync(drawable_xml,dx[0]+'	<item drawable="'+basefn+'" />\r\n	  </resources>'+dx[1]);
	log.info("PKG","drawable.xml");
	
	//Write icon_pack.xml
	var dx=fs.readFileSync(iconpack_xml).toString().split("</resources>");
	fs.writeFileSync(iconpack_xml,dx[0]+'	<item>'+basefn+'</item>\r\n    </resources>'+dx[1]);
	log.info("PKG","icon_pack.xml");
	
	//Write appfilter.xml
	var dx=fs.readFileSync(appfilter_xml).toString().split("</resources>");
	fs.writeFileSync(appfilter_xml,dx[0]+'	'+app.code+'\r\n	</resources>'+dx[1]);
	log.info("PKG","appfilter.xml");
	
	//Done
	log.info("SUC",app);
});
