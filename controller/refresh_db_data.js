

const NetService = require('./versionNetRequest')
const artifactDB = require('../db/dependence')
var refreshVersionService = {
    refreshVersionInfoFromALi: refreshVersionInfoFromALi,

}


async function refreshVersionInfoFromALi(){
    let artifactInfo = await artifactDB.find({});
    artifactInfo.forEach((info,index)=>{
        (function (item,t ) {   // 注意这里是形参
            setTimeout(function () {
                refreshDependenceVersionInfo(item)
            }, 3000 * t);	// 还是每秒执行一次，不是累加的
        })(info,index )
    });
}
async function refreshDependenceVersionInfo(info){
        await NetService.requestLatestVersionInfoFromSonatype(info,function (dependence) {
            NetService.requestLatestVersionInfoFromALiYun(dependence,function (dependence1) {
                NetService.requestLatestVersionInfoFromJitpack(dependence1)
            })
        })
}


exports.refreshVersionService = refreshVersionService;