const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    userId : String,
    content : String,
    title : String,
    packageName:[{ type: String, ref: 'apps' }],
    msgType : {
        type:String,
        enum:['mms','app'],
    },
    receiveDate:Number,
});

const message = mongoose.model('message',messageSchema);

module.exports = message;
