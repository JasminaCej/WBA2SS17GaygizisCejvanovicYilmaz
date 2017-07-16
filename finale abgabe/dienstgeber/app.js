var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var mongo = require('mongodb');
var monk = require('monk');
var http = require('http');
var faye = require('faye');

var dummyServices = require('./rest/dummyServices');
var eventServices = require('./rest/eventServices');
var shoppinglistServices = require('./rest/shoppinglistServices');
var localizationService = require('./rest/localizationServices');

var app = express();
var server = http.createServer(app);
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.on('handshake', function(clientId) {
    console.log('Client connected', clientId);
});

var db = monk('localhost:27017/CocktailCatering');
//var db = monk('mongodb://emin:wba2@ds153422.mlab.com:53422/cocktailcateringstudy');

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

dummyServices.register(app);
eventServices.register(app, bayeux);
shoppinglistServices.register(app,bayeux);
localizationService.register(app,bayeux);

var server = app.listen(process.env.PORT || 8181, function () {
    var port = server.address().port;
    console.log("Cocktail Catering app listening at http://127.0.0.1:%s", port);
});

bayeux.attach(server);

