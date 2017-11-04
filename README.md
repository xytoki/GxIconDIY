# 共享图标包自助打包系统

[![Build Status](https://www.travis-ci.org/homeii/GxIconDIY.svg?branch=master)](https://www.travis-ci.org/homeii/GxIconDIY)
（status仅供参考，每次打包都有可能成功有可能失败）

每个人的图标都可以是图标包。原理：服务端控制git commit上传图标修改配置文件再由travis CI打包构建上传到releases。

基于[NanoIconPack](https://github.com/by-syk/NanoIconPack)构建

打包地址：[GxIcon](http://1tb.win)

## 请到release查看你的图标状态

## 几个小工具
都是nodejs编写，需要npm install安装依赖
### autoMake.js
根据_automake.json自动打包
### autoInjector.js
简易资源注入工具，用法：
```
node autoInjector.js com.coolapk.market（包名） 1.png（文件）
```
