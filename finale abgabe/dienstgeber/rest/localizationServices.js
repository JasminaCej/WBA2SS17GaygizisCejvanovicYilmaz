'use strict';

var ObjectId = require('mongodb').ObjectID;

exports.register = function(app,bayeux) {

    function getCollection(db) {
        return db.get('localization');
    }

    // GET ALL
    app.get('/localization', function (req, res) {
        var collection = getCollection(req.db);
        collection.find(req.query,{},function(e,docs){
            var count = docs.length;
            if(count == 0){
                res.sendStatus(204);
            }else {
                res.json(docs);
            }
        });
    })

    //UPDATE EVENT BY ID
    app.put('/localization', function(req, res) {
        var id = req.param("_id");
        var collection = getCollection(req.db);
        collection.find(req.query, {} ,function (e,docs) {
            if(docs.length > 0){
                collection.update(req.query, req.body, {}, function (err, updatedEvent) {
                    collection.find({_id:ObjectId(id)}, {} ,function (e,docs) {
                        bayeux.getClient().publish('/localization', {
                            text : JSON.stringify(req.body.translations)});
                    });
                });

                res.send();
            } else {
                res.sendStatus(404); // Not found
            }
        });
    })

}