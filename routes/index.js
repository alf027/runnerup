var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

router.get('/login',function(req,res,next){
  res.render('session/login',{})
});

router.get('/register',function(req,res,next){
  res.render('session/register',{})
});

router.get('/logout',function(req,res,next){
  req.session=null;
  res.redirect('/')
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);


  //cloudinary.api.resources(function(items){
  //  console.log(items);
  //
  //  res.render('index', { img: items.resources, title: 'Gallery' });
  //});

  //res.render('index', { img: cloudinary.url("sample.jpg") });
});

module.exports = router;
