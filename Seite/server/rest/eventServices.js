'use strict';

exports.register = function(app) {

    function getCollection(db) {
        return db.get('event');
    }

    app.get('/event', function (req, res) {
        var collection = getCollection(req.db);
        collection.find({},{},function(e,docs){
            res.header('X-Total-Count', 2)
            res.json(docs);
        });
    })

    app.post('/event', function(req, res) {
        var collection = getCollection(req.db);
        collection.insert(req.body);
        res.send();
    })

    app.put('/event/:id', function(req, res) {
        var collection = getCollection(req.db);
        collection.update({"_id":req.param("id")}, req.body);
        res.send();
    })

    app.delete('/event/:id', function(req, res) {
        var collection = getCollection(req.db);
        collection.remove({"_id":req.param("id")});
        res.send();
    })
}