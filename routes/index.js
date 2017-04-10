var express = require('express');
var router = express.Router();
var request = require('request');
var cache = require('memory-cache');

var getContent = function() {
  return new Promise((resolve, reject) => {
    request('https://cdn.contentful.com/spaces/d114st8jtfe3/entries?access_token=792c19872092e71c1022a2ccff75d9d08721f4a285f910a0b3633b61fcac7979', (err, res, body) => {
      if (err) {
        reject(err); return;
      }
      cache.put('content', body, (5 * 60 * 1000)); // store it in memory cache for 5 minutes
      resolve(body);
    });
  });
}

var getContentMiddleware = function(req, res, next) {
  var cachedContent = cache.get('content');
 
  if (cachedContent !== null) {
    res.locals.content = cachedContent;
    next();
  } else {
    getContent().then(function(json) {
      res.locals.content = json;
      next();
    });
  }
}

router.get('/', getContentMiddleware, function(req, res, next) {
  console.log(res.locals.content)
  res.render('index', { 
    data: { 
      title: 'Express',
      message: "smonk wede",
      content: JSON.parse(res.locals.content)
    }
  });
});

module.exports = router;
