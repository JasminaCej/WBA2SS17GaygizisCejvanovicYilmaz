var Faye = require('faye');
var Request = require('rest-request');
var Q = require('q');
var cocktailCateringRestAPI = new Request('http://127.0.0.1:8181');
var cocktailDBRestApi = new Request('http://www.thecocktaildb.com/api/json/v1/1');


var client = new Faye.Client('http://127.0.0.1:8181/faye');

var translations;
cocktailCateringRestAPI.get('localization?lang=de')
    .then(function(localization) {
        translations = localization[0].translations;
    })

client.subscribe('/localization', function(changedTranslation) {
    console.log("Translation changed ... loading shopping lists")
    translations = JSON.parse(changedTranslation.text);

    cocktailCateringRestAPI.get('shoppinglist')
        .then(function(shoppinglists) {
            console.log(shoppinglists);
        })
});


client.subscribe('/event', function(publishedEvent) {
    var shoppingList = {};
    publishedEvent = JSON.parse(publishedEvent);

    printEventInfos(publishedEvent);

    cocktailCateringRestAPI.get('event?shoppingDate=' + publishedEvent.shoppingDate.toString().substr(0, 10))
        .then(function(events) {
            var cocktailPromises = [];

            for(var l = 0; l < events.length; l++) {
                var currentEvent = events[l];

                for (var k = 0; k < currentEvent.orders.length; k++) {
                    var currentOrder = currentEvent.orders[k];
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
                    };

                    printShoppingList(shoppingList);
                });
        })
});

function printEventInfos(event) {
    var formattedEventDate = "-";
    if(event.shoppingDate) {
        formattedEventDate = event.shoppingDate.toString().substr(0, 10);
    }

    console.log("Received an event: ");
    console.log("'" + event.name + "'" + " on " + event.date);
    console.log("Shopping date for event is " + formattedEventDate + "\n");

    if(event.orders && event.orders.length) {
        console.log("Order is:");

        for(var i = 0; i < event.orders.length; i++) {
            console.log(event.orders[i].amount + " " + event.orders[i].cocktail);
        }

        console.log('\n');
    }
}

function printShoppingList(shoppingList){
    for(var key in shoppingList) {
        console.log(key + " : " + shoppingList[key].amount + " " + shoppingList[key].measure)
    }
}
