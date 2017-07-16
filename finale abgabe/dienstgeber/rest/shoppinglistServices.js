'use strict';

var Request = require('rest-request');
var Q = require('q');
var monk = require('monk');
var ObjectId = require('mongodb').ObjectID;

var cocktailDBRestApi = new Request('http://www.thecocktaildb.com/api/json/v1/1');

var translations;

exports.register = function(app, bayeux) {

    monk('localhost:27017/CocktailCatering').get('localization').find({"lang":"de"},{},function(e,docs){
        translations = docs[0].translations;
    });

    bayeux.getClient().subscribe('/localization', function(changedTranslation) {
        console.log("I am also interested in changed localization...");
        translations = JSON.parse(changedTranslation.text);
    })


    function getCollection(db) {
        return db.get('event');
    }

    // GET ALL
    app.get('/shoppinglist', function (req, res) {
        var collection = getCollection(req.db);

        if(req.query.shoppingDate) { req.query.shoppingDate = new Date(req.query.shoppingDate).toString().substr(0, 10)};
        collection.find(req.query,{},function(e,docs){
            var shoppingLists = {};
            for(var i = 0; i < docs.length; i++) {
                var currentEvent = docs[i];

                shoppingLists[currentEvent.shoppingDate] = {};
            }

            var shoppingListPromises = [];

            for(var shoppingDate in shoppingLists) {
                shoppingListPromises.push(shoppingLists[shoppingDate] = createShoppingListForShoppingDay(
                    getEventsForShoppingDay(shoppingDate, docs)));
            }

            Q.allSettled(shoppingListPromises)
                .then(function(shoppingListResults) {
                    var j = 0;
                    for(var shoppingDate in shoppingLists) {
                        shoppingLists[shoppingDate] = shoppingListResults[j++].value;
                    }

                    res.json(shoppingLists);
                });
        });
    })
}

var getEventsForShoppingDay = function(date, events) {
    var res = [];
    for(var i = 0; i < events.length; i++) {
        if(date == events[i].shoppingDate) res.push(events[i]);
    }

    return res;
}

var createShoppingListForShoppingDay = function(events) {
    return new Q.promise(function (resolve, reject) {

        var shoppingList = {};
        var cocktailPromises = [];

        for(var l = 0; l < events.length; l++) {
            var event = events[l];
            for (var k = 0; k < event.orders.length; k++) {
                var currentOrder = event.orders[k];
                cocktailPromises.push(cocktailDBRestApi.get('search.php?s=' + currentOrder.cocktail));
            }
        }

        Q.allSettled(cocktailPromises)
            .then(function(results) {
                for(var i = 0; i < results.length; i++) {
                    var cocktailDbResult = results[i];
                    for(var j = 0; j < 15; j++) {
                        var measureForIngredient = cocktailDbResult.value.drinks[0]["strMeasure" + (j+1)].trim().replace("\n", "");
                        var ingredient = cocktailDbResult.value.drinks[0]["strIngredient" + (j+1)].replace("\n", "");

                        if(ingredient != "") {
                            var measure = translations[measureForIngredient] || measureForIngredient;
                            var ingredient = translations[ingredient] || ingredient;
                            var measureSplit = measure.split(" ");

                            if(shoppingList[ingredient]) {
                                shoppingList[ingredient] = {
                                    "amount": shoppingList[ingredient].amount + currentOrder.amount,
                                    "measure": measureSplit[1]
                                };
                            } else {
                                shoppingList[ingredient] = {
                                    "amount": currentOrder.amount * measureSplit[0].replace(",", "."),
                                    "measure": measureSplit[1]
                                }
                            }
                        }
                    }
                }

                resolve(shoppingList);
            });

    });
}