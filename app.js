require('dotenv').load();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('monk')(process.env.MONGOLAB_URI);

var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');

var unirest = require('unirest');
var cloudinary = require('cloudinary');
var fs = require('fs');
var busboy = require('connect-busboy');
var bcrypt = require('bcrypt');
var passport = require('passport');
var cookieSession = require('cookie-session');
var LocalStrategy = require('passport-local').Strategy;


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


var app = express();





app.set('trust proxy', 1);// trust first proxy

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(busboy({immediate: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LocalStrategy(
    function (username, password, done) {
      var users = db.get('users');
      users.findOne({email: username}, function (err, doc) {
        if (bcrypt.compareSync(password, doc.password)) {
          return done(null, {username: doc.email, id: doc._id})
        }
        return done(null, false);

      });
    })
);


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get('/styleguide', function (req, res, next) {
  res.render('styleguide', {title:'Styleguide'})
});

app.use(function (req, res, next) {
  console.log('user')
  console.log(req.user)
  res.locals.user = req.user;
  //res.locals.authenticated = !req.user.anonymous;
  next();
});


app.post('/local-login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

app.post('/local-reg', function (req, res, next) {
  var users = db.get('users');
  console.log(req.body.password);
  var hash = bcrypt.hashSync(req.body.password, 8);
  var user = {
    email: req.body.username,
    password: hash
  };
  users.insert(user, function (err, doc) {
    console.log(doc);

    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  })
});

//app.post('/upload', function (req, res, next) {
//  req.busboy.on('file', function (fieldname, file, filename) {
//    var stream = cloudinary.uploader.upload_stream(function (result) {
//        console.log(result);
//      },
//      {tags: 'testuser'});
//    file.pipe(stream);
//  });
//
//  //res.redirect('/')
//
//});



app.use('/', routes);
app.use('/photos', photos);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
