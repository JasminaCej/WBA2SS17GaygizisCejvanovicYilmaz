var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require("fs");

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/CocktailCatering');

var dummyServices = require('./rest/dummyServices');
var eventServices = require('./rest/eventServices');
var ingredientService = require('./rest/ingredientServices');
var cocktailServices = require('./rest/cocktailServices');
var shoppinglistServices = require('./rest/shoppinglistServices');

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
eventServices.register(app);
ingredientService.register(app);
cocktailServices.register(app);
shoppinglistServices.register(app);

var server = app.listen(process.env.PORT || 8181, function () {

    var port = server.address().port;

    console.log("Cocktail Catering app listening at http://127.0.0.1:%s", port);

})
