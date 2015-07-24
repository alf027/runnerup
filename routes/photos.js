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
      console.log(e);
      console.log(cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }));
      urlArr.push({url:cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }), id: e.public_id})
    });

    console.log(req.params.user);
    console.log(docs);
    res.render('photos/editTags',{photos:urlArr,user:req.params.user})
  })
});

//router.get('search:tag',function(req,res,next){
//  res.end('y')
//});



router.get('/search',function(req,res,next){
  console.log(req.body);
  console.log(req.query.tag)
  photos.find({tags:req.query.tag},function(err,docs) {
    console.log(err);
    console.log(docs);
    res.render('photos/searchResults', {photos:docs})
  })
});

router.post('/uploads/:user',function(req,res,next) {
  var propArr=[];
  for(var prop in req.body) {
    propArr.push(prop)
  }

  propArr.forEach(function(e){
    photos.findOne({public_id:e},function(err,doc){


      //doc.tags = req.body[prop];
      //doc.needsTagging = false;
      console.log('in update');
      photos.updateById(doc._id,{ $set:{tags:req.body[e], needsTagging:false}} ,function(err,tagged){
        console.log(req.body[prop]);
        console.log(err);
        console.log(tagged)
      });

    });
    //console.log(p)

    res.end('')

  })

});


router.get('/uploads',function(req,res,next){

    res.render('photos/uploadphotos')

});

router.post('/upload', function (req, res, next) {
  console.log(req.body);
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
