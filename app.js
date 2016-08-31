require('dotenv').config();

var db = require('mongodb');
db.connect({
  url: process.env.DB_URL,
  appUrl: process.env.APP_URL,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS
});

// URL Shortener
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');
var Url = require('./models/url');
 
 // Current via https://coligo.io/create-url-shortener-with-node-express-mongo/

// create a connection to our MongoDB
mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





// Working Alt method for address only submission
/*

var taken = '';

app.route('/new')
  .get('/new/:url*', function (req, res, next) {
    taken = req.params['url'] + req.params[0];
    res.send(taken);
    next();
  })
  .post('/api/address', function (req, res) {
      var longUrl = taken;
      var shortUrl = '';
      console.log(longUrl);
        mongoose.Promise = global.Promise;
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
          console.log('Saved: ' + shortUrl);
        });
      }

  });

    
});
  
*/





// tell Express to serve files from our public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
//   route to serve up the homepage (index.html)
  res.sendFile(path.join(__dirname, 'index.html'));
});




// POST method for UI

app.post('/api/shorten', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';

  // check if url already exists in database
  mongoose.Promise = global.Promise;
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
        console.log('Saved: ' + shortUrl);
      });
    }

  });

});


 // Handle a given shortUrl
 
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
      res.redirect('http://' + doc.long_url);
      console.log('Redirecting to: ' + doc.long_url);
    } /* else {
      // nothing found, take 'em home
      res.redirect(config.webhost);
      console.log('Unlisted entry');
    } */
  });

});

 
 app.listen(8080, function () {
  console.log('App open on port 8080:');
  
});