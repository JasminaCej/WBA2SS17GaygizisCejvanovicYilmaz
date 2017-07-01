'use strict';

exports.register = function(app) {

    app.get('/login/securityquestions', function (req, res) {
        res.json([
            "Dummy Question 1",
            "Dummy Question 2"
        ]);
    })

    app.post('/login', function (req, res) {
        res.send("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ");
    })

    app.get('/menu', function (req, res) {
        res.json([{"text": "Home","link": "/home"}, {"text": "Settings","link": "/settings"},{"text": "Help", "link": "/help"}]);
    })

    app.get('/properties', function (req, res) {
        res.json([{}]);
    })

    app.get('/login/logout', function(req, res) {
        res.send(true)
    })
}