var folder="app";
var p_vname=['/*AutoVersionName Start*/versionName "','"/*AutoVersionName End*/'];
var p_vcode=['/*AutoVersionCode Start*/versionCode ','/*AutoVersionCode End*/'];

var fs=require("fs");
var path=require("path");
var moment=require("moment");
var file=path.normalize(__dirname+"/../"+folder+"/build.gradle");
var new_vname=moment().format("YYYY.MM.DD.HH")+".nightly";
var new_vcode=moment().format("YYMMDDHHmm");
console.log(new_vname,new_vcode);
var f=fs.readFileSync(file).toString();
f=(f.split(p_vcode[0])[0]+p_vcode[0]+new_vcode+p_vcode[1]+f.split(p_vcode[1])[1]);
f=(f.split(p_vname[0])[0]+p_vname[0]+new_vname+p_vname[1]+f.split(p_vname[1])[1]);
fs.writeFileSync(file,f);