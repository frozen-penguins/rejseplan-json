var express = require('express');
var router = express.Router();
var http = require('http');
var parseString = require('xml2js').parseString;
var Promise = require('promise');

var getDepartureBoard = function(req) {
  return new Promise(function(resolve, reject) {
    if (!req.query.id) req.query.id = 1961;
    if (!req.query.useTog) req.query.useTog = 1;
    if (!req.query.useMetro) req.query.useMetro = 1;
    if (!req.query.useBus) req.query.useBus = 1;

    var options = {
      host: 'konkurrence.rejseplanen.dk',
      path: '/bin/rest.exe/departureBoard?id=' + req.query.id + '&useTog=' + req.query.useTog + '&useMetro=' + req.query.useMetro + '&useBus=' + req.query.useBus
    };

    callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
            parseString(str, function (err, result) {
              if (err) reject(err);  
              resolve(result);
            });
      });
    }

    http.request(options, callback).end();
  });
};

var getLocation = function(req) {
  return new Promise(function(resolve, reject) {
    if (!req.query.id) req.query.id = 1961;

    var options = {
      host: 'konkurrence.rejseplanen.dk',
      path: '/bin/rest.exe/location?input=' + req.query.input
    };

    callback = function(response) {
      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        parseString(str, function (err, result) {
          if (err) reject(err);
          var length = result.LocationList.StopLocation.length;
          var i = 0;
          result.LocationList.StopLocation.forEach(function(stop, index) {
            getDepartureBoard({'query': {'id': stop.$.id} }).then(function(busses) {
              stop.$.departureBoard = busses;
            });
            i++;
          });
          if (i == length) resolve(result);              
        });
      });
    }

    http.request(options, callback).end();
  });
};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/departureBoard', function(req, res) {
  getDepartureBoard(req).then(function(result) { res.json(result); });
});

router.get('/location', function(req, res) {
  getLocation(req).then(function(result) { res.json(result); });
});

module.exports = router;
