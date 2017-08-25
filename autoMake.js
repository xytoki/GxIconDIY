var folder="app";
var p_vname=['/*AutoVersionName Start*/versionName "','"/*AutoVersionName End*/'];
var p_pname=['/*AutoPackageName Start*/applicationId "','"/*AutoPackageName End*/'];
var p_vcode=['/*AutoVersionCode Start*/versionCode ','/*AutoVersionCode End*/'];
var exporter="http://gxicon.e123.pw/api.php?icon/export";
var folder="app";

var fs = require('fs');
var path=require("path");
var log=require("npmlog");
var moment=require("moment");
var wget = require('node-wget');
var request = require('request');
var drawable_folder=path.normalize(__dirname+"/"+folder+"/src/main/res/drawable-nodpi");
var drawable_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/xml/drawable.xml");
var iconpack_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values/icon_pack.xml");
var appfilter_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values/appfilter.xml");
var build_gradle=path.normalize(__dirname+"/"+folder+"/build.gradle");
var config=JSON.parse(fs.readFileSync("_autoMake.json"));
log.info("CFG",config);
log.info("DIR",drawable_folder);
log.info("DIR",drawable_xml);
log.info("DIR",iconpack_xml);
log.info("DIR",appfilter_xml);
log.info("DIR",build_gradle);

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
	var code = "<!-- " + app.label + " / ";
	if (app.labelEn.trim().length == 0) {
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
	request("http://nano.by-syk.com/code/"+pname, function (error, response, body) {
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
		theApp.drawable=codeAppName(theApp.labelEn||theApp.label);
		if(theApp.drawable.trim()=="")theApp.drawable=codeAppName(theApp.pkg);
		theApp.code=generateCode(theApp);
		cb(theApp);
	});
}
/* Update version */
log.info("VER",[config.pkg,config.vname,config.vcode]);
var f=fs.readFileSync(build_gradle).toString();
f=(f.split(p_vcode[0])[0]+p_vcode[0]+config.vcode+p_vcode[1]+f.split(p_vcode[1])[1]);
f=(f.split(p_vname[0])[0]+p_vname[0]+config.vname+p_vname[1]+f.split(p_vname[1])[1]);
f=(f.split(p_pname[0])[0]+p_pname[0]+config.pkg+p_pname[1]+f.split(p_pname[1])[1]);
//fs.writeFileSync(build_gradle,f);

/* Update icons */
fs.mkdir(drawable_folder,function(){})
var j=config.icons;
var next=function(i,cb){ 
	if(typeof(j[i])=="undefined")return cb();
	var pname=j[i][1].replace(new RegExp("\\.","g"),"_")+"_"+j[i][0];
	pname=pname.replace(/ /g,"");
	
	var fn=drawable_folder+"/"+basefn+".png";
	com.tencent.mobileqq
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
//next(0,function(){})
getAppData("com.tencent.mobileqq",function(e){log.info(e)});