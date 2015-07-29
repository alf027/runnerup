var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var photos = db.get('photos');
var cloudinary = require('cloudinary');

/* GET users listing. */
router.get('/profile/:id', function(req, res, next) {
  //res.send('respond with a resource')
  res.render('users/profile',{title: req.user.email + ' Profile'})
});

router.get('/profile/:id/tagged', function(req, res, next) {
  //res.send('respond with a resource')
  photos.find({uploader:req.user.id , needsTagging:false},function(err,docs) {
    var urlArr=[];
    docs.forEach(function(e){
      console.log(e);
      //console.log(cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }));
      urlArr.push({url:cloudinary.url(e.public_id, { width: 700, height: 500, crop: "fit" }), id: e.public_id, tags: e.tags})
    });
    console.log(docs)
    res.render('users/tagged',{title:' Tagged Photos', photos:urlArr})

  });
});

module.exports = router;
