var mongoose = require('mongoose');

var url = 'mongodb://172.16.9.11:27017/hhz_android_dependence';


mongoose.connect(url);
var db = mongoose.connection;
db.on('open',function() {
    console.log('数据库链接成功');
});

db.on('error',function() {
    console.log('数据库链接失败');
})
