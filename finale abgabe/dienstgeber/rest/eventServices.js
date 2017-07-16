'use strict';

var ObjectId = require('mongodb').ObjectID;

exports.register = function(app, bayeux) {

    function getCollection(db) {
        return db.get('event');
    }

    // GET ALL
    app.get('/event', function (req, res) {
        var collection = getCollection(req.db);
        collection.find(req.query,{},function(e,docs){
            var count = docs.length;
            if(count == 0){
                res.sendStatus(204);
            }else{
                res.json(docs);
            }
        });

    })

    // GET ID ALL
    app.get('/event/:id', function(req, res) {
        var id = req.param("id");
        var contentType = req.header("Content-Type");
        if(id.length != 24) {
            res.sendStatus(400);
        } else if(id.charAt(0)=='1') {
            res.sendStatus(403);
        } else if(contentType == "application/xml") {
            res.sendStatus(406)
        } else {
            var collection = getCollection(req.db);
            collection.find({_id:ObjectId(id)}, {}, function (e,docs) {
                if(docs.length > 0) {
                    res.json(docs[0]);
                } else {
                    res.sendStatus(404)
                }
            });
        }
    })

    // POST NEW
    app.post('/event', function(req, res) {
        var collection = getCollection(req.db);
        collection.find({"name" : req.body.name}, {}, function(e, docs) {
            if(docs.length == 0) {
                if (!isDateInPast(req.body.date)) {
                    req.body.shoppingDate = getNextShoppingDate(req.body.date);

                    var object = collection.insert(req.body).then(function (newEvent) {
                        bayeux.getClient().publish('/event', JSON.stringify(newEvent));
                    });

                    res.send();
                } else {
                    res.status(400).send("Event date is not valid.")
                }
            } else {
                res.sendStatus(409);
            }
        });
    })

    //UPDATE EVENT BY ID
    app.put('/event/:id', function(req, res) {
        var id = req.param("id");
        if(id.length != 24) {
            res.sendStatus(400);        // Bad Request
        }else if(id.charAt(0)=='1') {
            res.sendStatus(403);        // Forbidden
        }else {
            var collection = getCollection(req.db);
            collection.find({_id:ObjectId(id)}, {} ,function (e,docs) {
                if(docs.length > 0){
                    if (!isDateInPast(req.body.date)) {
                        req.body.shoppingDate = getNextShoppingDate(req.body.date);

                        collection.update({_id:ObjectId(id)}, req.body, {}, function (err, updatedEvent) {
                            collection.find({_id:ObjectId(id)}, {} ,function (e,docs) {
                                bayeux.getClient().publish('/event', JSON.stringify(docs[0]));
                            });
                        });

                        res.send();
                    } else {
                        res.status(400).send("Event date is not valid.")
                    }
                }else{
                    res.sendStatus(404); // Not found
                }
            });
        }
    })

    //DELETE EVENT BY ID
    app.delete('/event/:id', function(req, res) {
        var id = req.param("id");
        if(id.length != 24){
            res.sendStatus(400);
        }else if(id.charAt(0)=='1') {
            res.sendStatus(403);        // Forbidden
        }else{
            var collection = getCollection(req.db);
            collection.find({_id: ObjectId(id)}, {} ,function (e,docs) {
                if(docs.length > 0){
                    collection.remove({_id:ObjectId(id)});
                    res.send();

                    bayeux.getClient().publish('/event', JSON.stringify(docs[0]));
                }else{
                    res.sendStatus(404); // Not found
                }
            });
        }
    })


}

var isDateInPast = function(date) {
    return new Date(date) < new Date();
}

var getNextShoppingDate = function(date) {
    var shoppingDate = new Date(date);

    while(shoppingDate.getDay() != 4) {
        shoppingDate.setDate(shoppingDate.getDate()-1);
    }

    if(isDateInPast(shoppingDate)) {
        shoppingDate = new Date();

        if(shoppingDate.getDay() == 0){
            shoppingDate.setDate(shoppingDate.getDate()+1);
        }
    }

    return shoppingDate.toString().substr(0, 10);
}