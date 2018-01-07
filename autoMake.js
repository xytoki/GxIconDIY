var folder="app";
var p_vname=['/*AutoVersionName Start*/versionName "','"/*AutoVersionName End*/'];
var p_pname=['/*AutoPackageName Start*/applicationId "','"/*AutoPackageName End*/'];
var p_vcode=['/*AutoVersionCode Start*/versionCode ','/*AutoVersionCode End*/'];
var p_appname=['<string name="app_name">','</string><!--appname-->'];
var p_author=['<string name="preference_icons_summary_author">','</string><!--author-->'];
var p_color1=['<color name="color_primary">','</color><!--1-->'];
var p_color2=['<color name="color_primary_dark">','</color><!--2-->'];
var p_color3=['<color name="color_accent">','</color><!--3-->'];
var exporter="http://gxicon.e123.pw/api.php?icon/export";
var folder="app";

var fs = require('fs');
var path=require("path");
var log=require("npmlog");
var crypto = require('crypto');
var moment=require("moment");
var wget = require('node-wget');
var request = require('request');
var drawable_folder=path.normalize(__dirname+"/"+folder+"/src/main/res/drawable-nodpi");
var drawable_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/xml/drawable.xml");
var iconpack_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values/icon_pack.xml");
var colors_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values/colors.xml");
var appfilter_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/xml/appfilter.xml");
var strings_xml=path.normalize(__dirname+"/"+folder+"/src/main/res/values-zh/strings.xml");
var build_gradle=path.normalize(__dirname+"/"+folder+"/build.gradle");
var config=JSON.parse(fs.readFileSync("_autoMake.json"));
try{fs.mkdirSync("node_modules/fileCache")}catch(e){}
try{
	var iconcache=JSON.parse(fs.readFileSync("node_modules/_iconCache.json"));
	log.info("CACHE","iconcache loaded");
}catch(e){
	var iconcache={};
	log.info("CACHE","NO ICONCACHE FOUND");
}
log.info("INFO","GxIcon Packager v1");
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
	if(typeof(iconcache[pname])!=="undefined"){
		var theApp=iconcache[pname];
		theApp.pkg=theApp.pkg||pname;
		theApp.drawable=codeAppName(theApp.labelEn||theApp.label);
		if(theApp.drawable.trim()=="")theApp.drawable=codeAppName(theApp.pkg);
		theApp.code=generateCode(theApp);
		cb(theApp);
		return;
	}
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
		if(typeof(theApp.pkg)!=="undefined"&&typeof(theApp.launcher)!=="undefined"){
			iconcache[pname]=theApp;
		}
		theApp.pkg=theApp.pkg||pname;
		theApp.drawable=codeAppName(theApp.labelEn||theApp.label);
		if(theApp.drawable.trim()=="")theApp.drawable=codeAppName(theApp.pkg);
		theApp.code=generateCode(theApp);
		cb(theApp);
	});
}
//图片文件缓存函数
function getImgFile(url,to,cb){
	var hash=crypto.createHash('md5').update(url).digest('hex');
	var tmpfn=__dirname+"/node_modules/fileCache/"+hash;
	if(fs.existsSync(tmpfn)){
		fs.writeFileSync(to,fs.readFileSync(tmpfn));
		log.info("FCACHE","HIT",hash);
		cb();
	}else{
		wget({url: url, dest: tmpfn}, function(){
			fs.writeFileSync(to,fs.readFileSync(tmpfn));
			log.info("FCACHE","MISS",tmpfn);
			cb();
		});
	}
}
/* Update version */
log.info("VER",[config.pkg,config.vname,config.vcode]);
var f=fs.readFileSync(build_gradle).toString();
f=(f.split(p_vcode[0])[0]+p_vcode[0]+config.vcode+p_vcode[1]+f.split(p_vcode[1])[1]);
f=(f.split(p_vname[0])[0]+p_vname[0]+config.vname+p_vname[1]+f.split(p_vname[1])[1]);
f=(f.split(p_pname[0])[0]+p_pname[0]+config.pkg+p_pname[1]+f.split(p_pname[1])[1]);
fs.writeFileSync(build_gradle,f);

//Update appname
log.info("APP",[config.app,config.author]);
var f=fs.readFileSync(strings_xml).toString();
f=(f.split(p_appname[0])[0]+p_appname[0]+config.app+p_appname[1]+f.split(p_appname[1])[1]);
f=(f.split(p_author[0])[0]+p_author[0]+config.author+p_author[1]+f.split(p_author[1])[1]);
fs.writeFileSync(strings_xml,f);

//Update Color
var c1=config.color_primary||"#f44336";
var c2=config.color_primary_dark||"#d80f00";
var c3=config.color_accent||"#ff5252";
log.info("CLR",[c1,c2,c3]);
var f=fs.readFileSync(colors_xml).toString();
f=(f.split(p_color1[0])[0]+p_color1[0]+c1+p_color1[1]+f.split(p_color1[1])[1]);
f=(f.split(p_color2[0])[0]+p_color2[0]+c2+p_color2[1]+f.split(p_color2[1])[1]);
f=(f.split(p_color3[0])[0]+p_color3[0]+c3+p_color3[1]+f.split(p_color3[1])[1]);
fs.writeFileSync(colors_xml,f);

/* Update icons */
fs.mkdirSync(drawable_folder);
var j=config.icons;
var next=function(i,cb){ 
	if(typeof(j[i])=="undefined")return cb();
	var pname=j[i][1].replace(/ /g,"");
	log.info('');
	if(config.ignore_appfilter==true){
		var basefn=codeAppName(pname);
		var fn=drawable_folder+"/"+basefn+"_"+j[i][0]+".png";
		log.info("PKG",pname,basefn+" "+fn);
		getImgFile("http:"+j[i][2]+"!d192",fn, function(){
			//Write drawable.xml 
			var dx=fs.readFileSync(drawable_xml).toString().split("<!--AutoInjector End-->");
			fs.writeFileSync(drawable_xml,dx[0]+'	<item drawable="'+basefn+'" />\r\n	<!--AutoInjector End-->'+dx[1]);
			//Write icon_pack.xml
			var dx=fs.readFileSync(iconpack_xml).toString().split("<!--AutoInjector End-->");
			fs.writeFileSync(iconpack_xml,dx[0]+'	<item>'+basefn+'</item>\r\n	<!--AutoInjector End-->'+dx[1]);
			//Done
			log.info("SUC","NO APPFILTER",pname);
			next(i+1,cb)
		});
	}else{
		getAppData(pname,function(app){
			j[i][3]=j[i][3]||{};
			if(typeof(j[i][3].drawable)!="undefined"){
				app.drawable=codeAppName(j[i][3].drawable);
				app.code="<!-- DIY APPFILTER -->"+"\r\n"+j[i][3].appfilter;
			}
			var basefn=app.drawable;
			var fn=drawable_folder+"/"+basefn+".png";
			wget({url: "http:"+j[i][2]+"!d192", dest: fn}, function(){
				//Write drawable.xml 
				var dx=fs.readFileSync(drawable_xml).toString().split("<!--AutoInjector End-->");
				fs.writeFileSync(drawable_xml,dx[0]+'	<item drawable="'+basefn+'" />\r\n	<!--AutoInjector End-->'+dx[1]);
				//Write icon_pack.xml
				var dx=fs.readFileSync(iconpack_xml).toString().split("<!--AutoInjector End-->");
				fs.writeFileSync(iconpack_xml,dx[0]+'	<item>'+basefn+'</item>\r\n	<!--AutoInjector End-->'+dx[1]);
				//Write appfilter.xml
				var dx=fs.readFileSync(appfilter_xml).toString().split("<!--AutoInjector End-->");
				fs.writeFileSync(appfilter_xml,dx[0]+'	'+app.code+'\r\n	<!--AutoInjector End-->'+dx[1]);
				//Done
				log.info("SUC",app);
				next(i+1,cb)
			});
		});
	}
}
next(0,function(){
	log.info("PKG","All done");
	//write iconcache
	fs.writeFileSync("node_modules/_iconCache.json",JSON.stringify(iconcache));
	//log.info("CACHE","iconcache saved",iconcache);
})
