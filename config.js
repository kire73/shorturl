var config = {};

config.db = {};
// the URL shortening host - shortened URLs will be this + base58 ID
// for c9: https://shorturl-evilloria.c9users.io/
config.webhost = 'https://shortyourl.herokuapp.com/';

// your MongoDB host and database name
config.db.host = 'localhost';
config.db.name = 'url_shortener';

module.exports = config;