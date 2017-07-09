'use strict';

exports.register = function(app) {

    function getCollection(db) {
        return db.get('shoppinglist');
    }

    // GET ALL
    app.get('/shoppinglist', function (req, res) {
        var collection = getCollection(req.db);
        collection.find({},{},function(e,docs){
            var count = docs.length;
            if(count == 0){
                res.sendStatus(204);
            }else {
                res.json(docs);
            }
        });
    })

    // GET ID ALL
    app.get('/shoppinglist/:id', function(req, res) {
        var collection = getCollection(req.db);
        var id = req.param("id");
        var contentType = req.header("Content-Type");
        if(id.length != 24) {
            res.sendStatus(400);
        } else if(id.charAt(0)=='1') {
            res.sendStatus(403);
        } else if(contentType == "application/xml") {
            res.sendStatus(406)
        }else{
            collection.find({"_id":req.param("id")}, {}, function (e,docs) {
                if(docs && docs[0]) {
                    res.json(docs[0]);
                }else{
                    res.sendStatus(404);
                }
            });
        }

    })

    // POST NEW EINKAUFSLISTE
    app.post('/shoppinglist', function(req, res) {
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

}