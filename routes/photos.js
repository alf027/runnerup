var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');
var db = require('monk')('localhost/runnerUp');
var photos = db.get('photos');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

router.get('/uploads/:user',function(req,res,next) {
  photos.find({uploader:req.user.id},function(err,docs) {
    var urlArr=[];
    docs.forEach(function(e){
      console.log(e)
      console.log(cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }))
      urlArr.push(cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }))
    });

    console.log(req.params.user);
    console.log(docs);
    res.render('photos/editTags',{photos:urlArr})
  })
});

router.get('/uploads',function(req,res,next){

    res.render('photos/uploadphotos')

});

router.post('/upload', function (req, res, next) {
  req.busboy.on('file', function (fieldname, file, filename) {
    var stream = cloudinary.uploader.upload_stream(function (result) {
        console.log(result);
      var dbEntry = result;
      photos.insert({public_id:result.public_id, uploader:req.user.id, url:result.url, needsTagging:true},function(err,doc){
        //console.log(doc);
      })
      } , {tags: req.user.id});
    file.pipe(stream);


  });
  req.busboy.on('finish', function() {
    console.log('Done parsing form!');
    res.redirect('/photos/uploads/' + req.user.id)
  });



});

module.exports = router;
