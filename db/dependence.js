const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dependenceSchema = new Schema({
    dependenceName : String,//依赖名称
    subDependence : String,//字依赖 用json保存，最后取出来是数组
    moduleName:String,//所属module名称
    latestVersion:String,//网络请求获取到的最新版本号
    latestVersionUrl:String,   //仓库地址            方便定位仓库信息                                                                                                                                                                                                               version  version
    isInUse:Boolean,//是否被使用  如果删除依赖  置为false  为了保证数据都在
    tag:Array, //tag
    mark:String,   //备注
    rating:{
        type: Number,
        default: 1
    }
});

const dependence = mongoose.model('dependence',dependenceSchema);

module.exports = dependence;
