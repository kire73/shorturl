require('dotenv').config({silent: true});

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
 
 // built following the tutorial @
 // https://coligo.io/create-url-shortener-with-node-express-mongo/
 // Working to meet user stories @
 // https://little-url.herokuapp.com/


// create a connection to our MongoDB
mongoose.connect(process.env.DB_URL);
mongoose.Promise = global.Promise;

// for c9 use : 'mongodb://' + config.db.host + '/' + config.db.name

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// tell Express to serve files from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
//   route to serve the homepage
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Alt FCC basejump api method for address only submission

function validate(given, err){
  given = given.split('');
  var taken = [];
  for (var i = 0; i < 8; i++ ){
    taken.push(given[i]);
  }
  taken = taken.join('');
  
if (/https?:\/\//.test(taken)) {
    console.log("Valid URL");
} else {
    console.log("Invalid URL");
    throw ('URL Must have "http://" or "https://" when using the address bar method' + err);
}
}


app.get('/new/:url*', function findNew(req, res, longUrl){
  if (req.params['url'] + req.params[0]){
    longUrl = req.params['url'] + req.params[0];
  }
  validate(longUrl);
  
  console.log('found: ' + longUrl);
  
  var shortUrl = '';

  // check if url already exists in database
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (err){
          console.log(err);
        }
    if (doc){
      shortUrl = config.webhost + base58.encode(doc._id);
      res.send({'originalUrl': longUrl,'shortUrl': shortUrl});
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

        res.send({'original_url': longUrl,'shortUrl': shortUrl});
        console.log('Saved: ' + shortUrl);
      });
    }

  });

});

// Alt POST method for UI via coligo


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
    } else { // long URL not found in long_url field in urls collection
      
      // create a new entry:
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

// port: 8080 to run on c9
// port: process.env.PORT for heroku
 
 app.listen(process.env.PORT, function () {
  console.log('App open on port ' + process.env.PORT + ':');
  
});