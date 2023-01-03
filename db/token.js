const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    userId : String,
    token : String
});

const tokenDB = mongoose.model('token',tokenSchema);

module.exports = tokenDB;
