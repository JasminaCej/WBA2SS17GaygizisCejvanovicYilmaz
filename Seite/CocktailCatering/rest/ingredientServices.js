'use strict';

exports.register = function(app) {

    function getCollection(db) {
        return db.get('ingredient');
    }


    //GET ALL
    app.get('/ingredient', function (req, res) {
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

    //GET WITH ID
    app.get('/ingredient/:id', function(req, res) {
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
                }else {
                    res.sendStatus(404)
                }
            });
        }

    })

    //POST NEW
    app.post('/ingredient', function(req, res) {
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

    //UPDATE WITH ID
    app.put('/ingredient/:id', function(req, res) {
        var id = req.param("id");
        if(id.length != 24) {
            res.sendStatus(400);        // Bad Request
        }else if(id.charAt(0)=='1') {
            res.sendStatus(403);        // Forbidden
        }else{
            var collection = getCollection(req.db);
            collection.find({"_id": req.body._id}, {} ,function (e,docs){
                if(docs.length > 0){
                    collection.update({"_id":req.param("id")}, req.body);
                    res.send();
                }else{
                    res.sendStatus(404);
                }
            })
        }
    })

    //DELETE WITH ID
    app.delete('/ingredient/:id', function(req, res) {
        var id = req.param("id");
        if(id.length != 24){
            res.sendStatus(400);
        }else if(id.charAt(0)=='1') {
            res.sendStatus(403);        // Forbidden
        }else{
            var collection = getCollection(req.db);
            collection.find({"_id": req.body._id}, {} ,function (e,docs) {
                if(docs.length > 0){
                    collection.remove({"_id":req.param("id")});
                    res.send();
                }else{
                    res.sendStatus(404); // Not found
                }
            })
        }
    })
}