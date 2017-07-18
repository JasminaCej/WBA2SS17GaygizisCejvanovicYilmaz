'use strict';

exports.register = function(app) {
    
    app.get('/login', function(req, res) {
        res.sendStatus(405)
    })

    app.post('/login', function (req, res) {
        var username = req.body.login.username;

        if(username == "dummy") {
            res.sendStatus(401)     // unathorized
        } else {
            res.send("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ");
        }
    })
    })
}
