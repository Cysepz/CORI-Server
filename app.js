var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// ----- 環境變數 -----
require('dotenv').config();
var sql = require('./mysql');

// 測試資料庫連線是否成功
sql.pool.query('SELECT 1+1 AS solution', (error, results) => {
  if (error) throw error;
  console.log('DB Connnection is OK');
});

// ----- 載入 Router File -----
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const userRouter = require('./routes/userRouter');
const activityRouter = require('./routes/activityRouter');
const reportRouter = require('./routes/reportRouter');
const permissionRouter = require('./routes/permissionRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: '*',
  // credentials: true
}));

// ----- 使用 Router -----
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/user', userRouter);
app.use('/api/activity', activityRouter);
app.use('/api/permission', permissionRouter);
app.use('/api/report', reportRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
