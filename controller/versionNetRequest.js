const request = require('request');
const artifactDB = require('../db/dependence');
const pushService = require('./pushService')
const dependenceUtils = require('../utils/dependenceUtils')

module.exports = {


    requestLatestVersionInfoFromSonatype:  (info,callback) => {
        //get 请求外网
        let{groupId,artifactId} = dependenceUtils.getGroupIdAndArtifactId(info.dependenceName)

        function getRealVersion(data) {
            let version  = null;
            function  forLoopData(data){
                if (data==null) {
                    version = null;
                }
                if (data.type==="A") {
                    version =  data.children[data.children.length-1].nodeName;
                }else{
                    if (data.children!=null&&data.children.length>0) {
                        forLoopData(data.children[0])
                    }
                }
            }
            forLoopData(data)
         return version;
        }

        // console.log("开始请求:"+groupId)
        request.get('https://repository.sonatype.org/service/local/repositories/central-proxy/index_content/?_dc='+Date.now()+'&groupIdHint='+groupId+'&artifactIdHint='+artifactId,
            {
                encoding: "utf-8",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            },
            async function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    let app = JSON.parse(body);
                    //app.data 就是返回的这个实体    G                        A                                  V
                    let netVersion = getRealVersion(app.data)
                        if(netVersion!=null){
                            let artifactDependence =  info.dependenceName;
                            let artifactInfo = await artifactDB.findOne({dependenceName: artifactDependence}).lean();
                            let compareResult = dependenceUtils.isNetVersionLatestThanLocalVersionCode(netVersion,artifactInfo.latestVersion);
                            console.log("版本号比较结果: net:"+netVersion+"...local:"+artifactInfo.latestVersion+"...result:"+compareResult)
                            if (artifactInfo.latestVersion!==netVersion&&compareResult>0) {
                                //数据库的最新版本 和 maven的最新斑斑
                                //走机器人推送 本地版本发生了变化
                                    artifactInfo.latestVersion = netVersion;
                                    pushService.pushNewVersion(artifactInfo)
                                    console.log("sonatype 找到了:"+info.dependenceName);
                                    const latestVersionUrl1 = 'https://repository.sonatype.org/index.html#nexus-search;gav~'+groupId+'~'+artifactId+'~~~'
                                    artifactDB.update({dependenceName:artifactDependence},{latestVersion: netVersion,latestVersionUrl:latestVersionUrl1},{multi: true},function(err,raw){});
                            }else{ //版本号 小于 或者相同 都得继续查询
                            setTimeout( function(){
                                callback(info)
                            }, 5 * 1000 );

                        }
                    }else{
                        setTimeout( function(){
                            callback(info)
                        }, 5 * 1000 );
                    }

                }
            }
        );

    },







    requestLatestVersionInfoFromALiYun:  (info,callback) => {
        //get 请求外网
        let{groupId,artifactId} = dependenceUtils.getGroupIdAndArtifactId(info.dependenceName)
        // console.log("开始请求:"+groupId)
         request('https://developer.aliyun.com/artifact/aliyunMaven/searchArtifactByGav?groupId='+groupId+'&artifactId='+artifactId+'&version=&repoId=all&_input_charset=utf-8', async function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let app = JSON.parse(body);
                //不知道为什么  调用下面的saveInfo  无法调用
                if (app.object!=null&&app.object.length>0){
                    let data = app.object[0];
                   let artifactDependence =  info.dependenceName;
                    let artifactInfo = await artifactDB.findOne({dependenceName: artifactDependence}).lean();
                    let compareResult = dependenceUtils.isNetVersionLatestThanLocalVersionCode(data.version,artifactInfo.latestVersion);
                    console.log("版本号比较结果: net:"+data.version+"...local:"+artifactInfo.latestVersion+"...result:"+compareResult)
                    if (artifactInfo.latestVersion!==data.version&&compareResult>0) {
                        //数据库的最新版本 和 maven的最新斑斑
                            //走机器人推送 本地版本发生了变化
                            if (data.version!=null){
                                artifactInfo.latestVersion = data.version
                                pushService.pushNewVersion(artifactInfo)
                                let url = 'https://developer.aliyun.com/mvn/search';
                                artifactDB.update({dependenceName:artifactDependence},{latestVersion: data.version,latestVersionUrl:url},{multi: true},function(err,raw){});
                            }else{
                                setTimeout( function(){
                                    callback(info)
                                }, 3 * 1000 );
                            }
                    }else{
                        setTimeout( function(){
                            callback(info)
                        }, 3 * 1000 );
                    }
                }else{
                    setTimeout( function(){
                        callback(info)
                    }, 3 * 1000 );
                }

            }
        })

    },

    /**
     * 一般是github的地址
     * @param info
     */
    requestLatestVersionInfoFromJitpack:  (info) => {
        let{groupId,artifactId} = dependenceUtils.getGroupIdAndArtifactId(info.dependenceName)
        console.log("开始请求:"+groupId)
        request.get(//发送post
            'https://jitpack.io/api/refs/'+groupId+'.'+artifactId+'/Common',
            {
                encoding: "utf-8",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            },
            async function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    let app = JSON.parse(body);
                    //不知道为什么  调用下面的saveInfo  无法调用
                    if (app.tags!=null&&app.tags.length>0){
                        let tagName = app.tags[0].tag_name;
                        let artifactDependence =  info.dependenceName;
                        let compareResult = dependenceUtils.isNetVersionLatestThanLocalVersionCode(tagName,info.latestVersion);
                        if (compareResult>0) {
                            let artifactInfo = await artifactDB.findOne({dependenceName: artifactDependence}).lean();
                            if (artifactInfo.latestVersion!==tagName) {
                                //数据库的最新版本 和 maven的最新斑斑
                                //走机器人推送 本地版本发生了变化
                                artifactInfo.latestVersion = tagName
                                pushService.pushNewVersion(artifactInfo)
                            }
                            console.log("jitpack 找到了:"+info.dependenceName+"...."+tagName)
                            let url = 'https://jitpack.io/#'+groupId+'.'+artifactId+'/Common'
                            if(tagName!=null){
                                artifactDB.update({dependenceName:artifactDependence},{latestVersion:tagName,latestVersionUrl:url},{multi: true},function(err,raw){});
                            }
                        }else{
                            console.log("jitpack 的找不到了:"+info.dependenceName)

                        }
                        }

                }
            }
        );
    },

}


