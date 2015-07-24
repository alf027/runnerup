var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});



/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(cloudinary.image("sample.jpg", { alt: "Sample Image" }));
  res.render('index', { img: cloudinary.url("sample.jpg") });
});

module.exports = router;
