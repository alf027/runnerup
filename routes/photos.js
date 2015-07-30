var express = require('express');
var router = express.Router();
var cloudinary = require('cloudinary');
var db = require('monk')(process.env.MONGOLAB_URI);
var users = db.get('users');
var photos = db.get('photos');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

var userCheck = function (req, res, next) {
  if (!req.user) {
    res.redirect('/login')
  }
  next()
};


router.get('/uploads/:user', userCheck, function (req, res, next) {
  //console.log(req.locals.user);
  photos.find({uploader: req.user.id, needsTagging: true}, function (err, docs) {
    var urlArr = [];
    docs.forEach(function (e) {
      console.log(e);
      //console.log(cloudinary.url(e.public_id, { width: 200, height: 300, crop: "fill" }));
      urlArr.push({url: cloudinary.url(e.public_id, {width: 700, height: 500, crop: "fit"}), id: e.public_id})
    });

    //console.log(req.params.user);
    //console.log(docs);
    res.render('photos/editTags', {photos: urlArr, title: "Edit Tags"})
  })
});

//router.get('search:tag',function(req,res,next){
//  res.end('y')
//});


router.get('/search', function (req, res, next) {
  var urlArr = [];
  //console.log(req.body);
  //console.log(req.query.tag);
  photos.find({tags: {$eq: req.query.tag}}, function (err, docs) {
    docs.forEach(function (e,i) {
      //console.log(e);
      //console.log(cloudinary.url(e.public_id, {width: 200, height: 300}));
      users.findOne({_id: e.uploader}, function (err, doc) {
        //console.log(doc);
        urlArr.push({
          url: cloudinary.url(e.public_id, {width: 400, crop: "fill"}),
          id: e.public_id,
          uploader: doc.email
        });
        if (i===docs.length -1) {
          console.log('inside if statement');
          //console.log(docs);
          console.log(urlArr);
          res.render('photos/searchResults', {photos: urlArr, title: 'Search Results'})
        }
      });



    });

  })
});

router.post('/uploads/:user', function (req, res, next) {
  console.log('request body ' + req.body);
  var propArr = [];
  for (var prop in req.body) {
    console.log(prop)
    propArr.push(prop)
  }
  console.log('prop arr ' + propArr)

  propArr.forEach(function (e) {
    console.log(e);
    photos.findOne({public_id: e}, function (err, doc) {
      console.log('this should be the tag ' + req.body[e]);
      console.log(req.body[e].split(' '));


      //doc.tags = req.body[prop];
      //doc.needsTagging = false;
      if (req.body[e]) {
        console.log('in update');
        photos.updateById(doc._id, {$set: {tags: req.body[e].split(' '), needsTagging: false}}, function (err, tagged) {
          //console.log(req.body[prop]);
          //console.log(err);
          //console.log(tagged)
        });
      }


    });
    //console.log(p)


  });
  res.redirect('/users/profile/' + req.user.id + '/tagged')
});


router.get('/uploads', userCheck, function (req, res, next) {

  res.render('photos/uploadphotos', {title: 'Upload Race Photos'})

});

router.post('/upload', function (req, res, next) {
  var photoArr = [];
  var files = 0, finished = false;
  req.busboy.on('file', function (fieldname, file, filename) {
    ++files;
    var stream = cloudinary.uploader.upload_stream(function (result) {
      console.log('in stream');
      console.log(result);
      if (--files === 0 && finished) {
        console.log('inside if');
        res.redirect('/photos/uploads/' + req.user.id)
      }

      //var dbEntry = result;
      //var photoObj = {public_id:result.public_id, uploader:req.user.id, url:result.url, needsTagging:true};
      //photoArr.push(photoObj);
      photos.insert({
        public_id: result.public_id,
        uploader: req.user.id,
        url: result.url,
        needsTagging: true
      }, function (err, doc) {
        if (!err) {
        }
        console.log('inserting photo in db');
        //console.log(doc);
      })
    }, {tags: req.user.id});


    file.pipe(stream);
    stream.on('finish', function (test) {
      console.log(test);
      console.log('end stream')
    });
    stream.on('close', function () {
      console.log('close')
    })

  });

  req.busboy.on('finish', function () {
    finished = true;
    //photoArr.forEach(function (e) {
    //  console.log(e)
    //});
  });
});

module.exports = router;
