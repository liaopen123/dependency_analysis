var mongoose = require('mongoose');

var url = 'mongodb://127.0.0.1:27017/hhz_android_dependence';


mongoose.connect(url);
var db = mongoose.connection;
db.on('open',function() {
    console.log('数据库链接成功');
});

db.on('error',function() {
    console.log('数据库链接失败');
})
