const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
    tag : {
        type:String,
        unique: true
    },
});


const artifact = mongoose.model('tags',tagSchema);

module.exports = artifact;
