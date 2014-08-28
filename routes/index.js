var express = require('express');
var router = express.Router();
var http = require('http');
var parseString = require('xml2js').parseString;
var Promise = require('promise');

var config = {
  host: 'xmlopen.rejseplanen.dk',
  bin: '/bin/rest.exe'
};

var callEndpoint = function(options) {
  return new Promise(function(resolve, reject) {
    console.log(options);
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

var transportType = function(req) {
  var transportString = '';
  if (req.query.useTog) transportString = '&useTog=' + req.query.useTog;
  if (req.query.useBus) transportString += '&useBus=' + req.query.useBus;
  if (req.query.useMetro) transportString += '&useMetro=' + req.query.useMetro;
  
  return transportString;
};

var time = function(req) {
  var timeString = '';
  if (req.query.date) timeString += '&date=' + req.query.date;
  if (req.query.time) timeString += '&time=' + req.query.time;
  if (req.query.searchForArrival) timeString += req.query.searchForArrival;
  
  return timeString;
};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/journeyDetail', function(req, res) {
  var options = {
    host: config.host,
    path: config.bin + '/journeyDetail?ref=' + req.query.ref
  };
  
  callEndpoint(options).then(function(result) { res.json(result); });
});

router.get('/stopsNearby', function(req, res) {
  var options = {
    host: config.host,
    path: config.bin + '/stopsNearby?coordX=' + req.query.coordX + '&coordY=' + req.query.coordY + '&maxRadius=' + req.query.maxRadius + '&maxNumber=' + req.query.maxNumber
  };
  
  callEndpoint(options).then(function(result) { res.json(result); });
});

router.get('/departureBoard', function(req, res) {
  var options = {
    host: config.host,
    path: config.bin + '/departureBoard?id=' + req.query.id + transportType(req) + time(req)
  };
  
  callEndpoint(options).then(function(result) { res.json(result); });
});

router.get('/multiDepartureBoard', function(req, res) {
  var idString = '?id1=' + req.query.id1;
  if (req.query.id2) idString += '&id2=' + req.query.id2;
  if (req.query.id3) idString += '&id3=' + req.query.id3;
  if (req.query.id4) idString += '&id4=' + req.query.id4;
  if (req.query.id5) idString += '&id5=' + req.query.id5;
  if (req.query.id6) idString += '&id6=' + req.query.id6;
  if (req.query.id7) idString += '&id7=' + req.query.id7;
  if (req.query.id8) idString += '&id8=' + req.query.id8;
  if (req.query.id9) idString += '&id9=' + req.query.id9;
  if (req.query.id10) idString += '&id10=' + req.query.id10;
  
  var options = {
    host: config.host,
    path: config.bin + '/departureBoard' + idString + transportType(req) + time(req)
  };
  
  callEndpoint(options).then(function(result) { res.json(result); });
});

router.get('/trip', function(req, res) {
  if (req.query.originId && req.query.destId) {
    var options = {
      host: 'xmlopen.rejseplanen.dk',
      path: config.bin + '/trip?originId=' + req.query.originId + '&destId=' + req.query.destId + transportType(req) + time(req)
    };

    callEndpoint(options).then(function(result) { res.json(result); });
  }
  else if (req.query.originId && !req.query.destId) {
    var options = {
      host: 'xmlopen.rejseplanen.dk',
      path: config.bin + '/trip?originId=' + req.query.originId + '&destCoordX=' + req.query.destCoordX + '&destCoordY=' + req.query.destCoordY + '&destCoordName=' + req.query.destCoordName + transportType(req) + time(req)
    };

    callEndpoint(options).then(function(result) { res.json(result); });
  }
  else if (!req.query.originId && req.query.destId) {
    var options = {
      host: config.host,
      path: config.bin + '/trip?originCoordX=' + req.query.originCoordX + '&originCoordY=' + req.query.originCoordY + '&originCoordName=' + req.query.originCoordName + '&destId=' + req.query.destId + transportType(req) + time(req)
    };

    callEndpoint(options).then(function(result) { res.json(result); });
  }
  else {
    var options = {
      host: config.host,
      path: config.bin + '/trip?originCoordX=' + req.query.originCoordX + '&originCoordY=' + req.query.originCoordY + '&originCoordName=' + req.query.originCoordName + '&destCoordX=' + req.query.destCoordX + '&destCoordY=' + req.query.destCoordY + '&destCoordName=' + req.query.destCoordName + transportType(req) + time(req)
    };

    callEndpoint(options).then(function(result) { res.json(result); });
  }
});

router.get('/location', function(req, res) {
  if (!req.query.input) req.query.input = '';
  var options = {
    host: config.host,
    path: config.bin + '/location?input=' + req.query.input + transportType(req)
  };  
  
  callEndpoint(options).then(function(result) { res.json(result); });
});

module.exports = router;
