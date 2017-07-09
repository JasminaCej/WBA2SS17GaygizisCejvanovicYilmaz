'use strict';

var ObjectId = require('mongodb').ObjectID;

exports.register = function(app) {

    function getCollection(db) {
        return db.get('event');
    }


    // GET ALL
    app.get('/event', function (req, res) {
        var collection = getCollection(req.db);
        collection.find({},{},function(e,docs){
            var count = docs.length;
            if(count == 0){
                res.sendStatus(204);
            }else{
                console.log(count);
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
                collection.insert(req.body);
                res.send();
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
                    collection.update({_id:ObjectId(id)}, req.body);
                    res.send();
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
                }else{
                    res.sendStatus(404); // Not found
                }
            });
        }
    })
}
