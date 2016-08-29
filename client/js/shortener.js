// URL Shortener
var express = require('express');
var app = express();
var path = require('path');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
// base58 for encoding and decoding functions
var base58 = require('./base.js');
// grab the url model
var Url = require('./url');
 
 // Current via https://coligo.io/create-url-shortener-with-node-express-mongo/

// create a connection to our MongoDB
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// tell Express to serve files from our public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
//   route to serve up the homepage (index.html)
  res.sendFile(path.join(__dirname, 'index.html'));
});
 
app.post('/api/shorten', function(req, res){
//   route to create and return a shortened URL given a long URL
});

app.get('/:encoded_id', function(req, res){
  // route to redirect the visitor to their original URL given the short URL
});
 
 app.listen(8080, function () {
  console.log('App open on port 8080:');
});

app.post('/api/shorten', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';

  // check if url already exists in database
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (err){
          console.log(err);
        }
    if (doc){
      shortUrl = config.webhost + base58.encode(doc._id);
      res.send({'shortUrl': shortUrl});
    } else {
      // The long URL was not found in the long_url field in our urls
      // collection, so we need to create a new entry:
      var newUrl = Url({
        long_url: longUrl
      });

      // save the new link
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }

        // construct the short URL
        shortUrl = config.webhost + base58.encode(newUrl._id);

        res.send({'shortUrl': shortUrl});
      });
    }

  });

});
 
 app.get('/:encoded_id', function(req, res){
  var base58Id = req.params.encoded_id;
  var id = base58.decode(base58Id);

  // check if url already exists in database
  Url.findOne({_id: id}, function (err, doc){
    if (err){
      console.log(err);
    }
    if (doc) {
      // found an entry in the DB, redirect the user to their destination
      res.redirect(doc.long_url);
    } else {
      // nothing found, take 'em home
      res.redirect(config.webhost);
    }
  });

});