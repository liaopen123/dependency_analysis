const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dependenceSchema = new Schema({
    dependenceName : String,
    subDependence : String,
    moduleName:String,
    tag:Array,
    mark:String,
    rating:{
        type: Number,
        default: 1
    }
});

const dependence = mongoose.model('dependence',dependenceSchema);

module.exports = dependence;
