const port = 3000;
const http = require('http');
const url = require('url');
const fs = require('fs');
const readline = require('readline');

var gkey = fs.readFileSync('googleAPI.key').toString();
console.info("google API key: " + gkey);

const googleMapsClient = require('@google/maps').createClient({
   key: gkey,
   Promise: Promise
});

const destination = {"lat": 50.580276, "lng": 8.664836};

function readOrigins() {
   const lineByLine = require('n-readlines');
   const liner = new lineByLine('input.csv');
   var o = [];

   let line;
   while (line = liner.next()) {
      //console.log('line ' + lineNumber + ': ' + line.toString());
      var lineItems = line.toString().split(';');
      var newOrigin = {lat: lineItems[0], lng: lineItems[1], count: lineItems[2]}
      //console.debug("new origin: " + JSON.stringify(newOrigin));
      o.push(newOrigin);
   }
   return o;
   //console.log("*** origings read ***");
}

function readOrigins() {
   const lineByLine = require('n-readlines');
   const liner = new lineByLine('input.csv');
   var o = [];

   let line;
   while (line = liner.next()) {
      //console.log('line ' + lineNumber + ': ' + line.toString());
      var lineItems = line.toString().split(';');
      var newOrigin = {lat: lineItems[0], lng: lineItems[1], count: lineItems[2]}
      //console.debug("new origin: " + JSON.stringify(newOrigin));
      o.push(newOrigin);
   }
   return o;
   //console.log("*** origings read ***");
}

http.createServer(function (req, res) {
   if (req.url == '/json' || req.url == '/csv') {
      var origins = readOrigins(origins);
      //console.log("req.url: " + req.url);
      var promises = [];
      var resultJSON = { origins: [], destination: destination };
      var resultCSV = [];
      resultCSV[0] = "nr\tcount\tlat\tlon\tcar\ttrain\tbike\taddr";

      for (var index = 0; index < origins.length; index++) {
         //iterate all origins
         promises[index] = new Promise(function(resolve, reject) {
            var origin = origins[index];
            var linePromises = [index,origin.count,origin.lat,origin.lng];
            //console.log("calc origin " + index + ": " + JSON.stringify(origin));

            var qryC = {origin: origin, destination: destination, mode: 'driving'};
            //console.log("["+index+"] (car) qMaps qry: " + JSON.stringify(qryC));
            linePromises[4] = googleMapsClient.directions(qryC).asPromise()
            .then((response) => {
               //console.log("(car) gMaps response " + JSON.stringify(response.json.routes[0].legs[0]));
               var res = Math.round(response.json.routes[0].legs[0].duration.value/60);
               //console.log("(car) duration: " + res + " for " + JSON.stringify(response.json.routes[0].legs[0].start_location));
               return res;
            }).catch((err) => {
               console.log(err);
               reject(err);
            });

            var qryT = {origin: origin, destination: destination, mode: 'transit', transit_mode: ['bus', 'subway', 'train', 'tram', 'rail']};
            //console.log("["+index+"] (train) qMaps qry: " + JSON.stringify(qryT));
            linePromises[5] = googleMapsClient.directions(qryT).asPromise()
            .then((response) => {
               //console.log("(train) gMaps response " + JSON.stringify(response));
               if(response.json.status == "OK") {
                  var res = Math.round(response.json.routes[0].legs[0].duration.value/60);
                  //console.log("(train) duration: " + res + " for " + JSON.stringify(response.json.routes[0].legs[0].start_location));
                  return res;
               } else {
                  console.log("(train) no duration for " + JSON.stringify(response.query.origin));
                  return 9999;
               }
            }).catch((err) => {
               console.log(err);
               reject(err);
            });

            var qryB = {origin: origin, destination: destination, mode: 'bicycling'};
            //console.log("["+index+"] (bike) qMaps qry: " + JSON.stringify(qryC));
            linePromises[6] = googleMapsClient.directions(qryB).asPromise()
            .then((response) => {
               //console.log("(bike) gMaps response " + JSON.stringify(response.json.routes[0].legs[0]));
               var res = [];
               res[0] = Math.round(response.json.routes[0].legs[0].duration.value/60);
               res[1] = response.json.routes[0].legs[0].start_address;
               //console.log("(bike) duration: " + res[0] + " for " + JSON.stringify(response.json.routes[0].legs[0].start_location));
               return res.join('\t');
            }).catch((err) => {
               console.log(err);
               reject(err);
            });

            Promise.all(linePromises)
            .then(values => {
               //compile all results
               //console.log("*** all linePromises done ***");
               //console.log("vaules(linePromises): " + values.join(';'));
               var count = parseInt(values[1]);
               var lat = values[2];
               var lng = values[3];
               var car = values[4];
               var train = values[5];
               var temp = values[6].split('\t');
               var bike = parseInt(temp[0]);
               var addr = temp[1];
               newEntry = { origin: {addr: addr, lat: lat, lng: lng, count: count}, durations: { car: car, train: train, bike: bike}};
               resultJSON.origins.push(newEntry);
               resultCSV.push(values.join('\t'));
               resolve(values);
            });
         });
      }

      Promise.all(promises)
      .then(values => {
         //console.log("vaules(promises):" + values);
         if (req.url == '/json') {
            console.log("return json");
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.write(JSON.stringify(resultJSON));
         }
         if (req.url == '/csv') {
            console.log("return csv");
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(resultCSV.join('\n'));
         }
         res.end();
      })
   }
}).listen(port);

console.debug('app is running on port ' + port);
