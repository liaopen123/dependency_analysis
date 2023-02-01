var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var analysisDependencyRouter = require('./routes/analysisDependency');
const schedule = require('./controller/versionInfoschedule');
require('./db/db')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//引入第三方中间件,要在router之前引入才能通过req.body获取到请求的数据
app.use(bodyParser.json({limit: '5000mb'}));
app.use(bodyParser.urlencoded({limit: '5000mb',extended:false}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
// 解决跨域问题
app.all("*",function(req,res,next){
  // 设置允许跨域的域名,*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin','*');
  // 允许的header类型
  res.header('Access-Control-Allow-Headers','content-type');
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods','DELETE,PUT,POST,GET,OPTIONS');
  if(req.method.toLowerCase() == 'options')
    res.send(200); // 让options 尝试请求快速结束
  else
    next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dependencyAnalysis',analysisDependencyRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//定时轮训 获取最新版本
schedule.scheduleCron();//定时任务
module.exports = app;
