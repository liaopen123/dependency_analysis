const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dependenceSchema = new Schema({
    dependenceName : String,
    subDependence : String,
    moduleName:String,
    latestVersion:String,
    latestVersionUrl:String,   //仓库地址            方便定位仓库信息                                                                                                                                                                                                               version  version
    tag:Array,
    mark:String,
    rating:{
        type: Number,
        default: 1
    }
});

const dependence = mongoose.model('dependence',dependenceSchema);

module.exports = dependence;
