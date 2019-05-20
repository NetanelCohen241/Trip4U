var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//D
app.post('/login', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM users")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})


//N
app.post('/register', function(req, res){
    var fields = "userName, password, firstName, lastName, country, city, email, field1, field2, questionForPassword, answer";
    var values = "";
    for (var param in req.body){
        values+=req.body[param]+", ";
    }
    values = values.substring(0, values.length - 2);
    console.log(values)
    var sql = "INSERT INTO users ("+fields+") VALUES ("+values+");"
    DButilsAzure.execQuery(sql)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})


//D
app.post('/getSecurityQuestion', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})


//N
app.post('/restorePassword', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM users WHERE userName="+req.body['userName'])
        .then(function(result){
            if(result.length === 0)
                res.send(JSON.stringify({response: "user does not exists"}))
            else {
                var user = result[0];
                if(user['answer'] === req.body['answer'])
                    res.send(JSON.stringify({password: user['password']}))
                else
                    res.send(JSON.stringify({response: "Wrong answer"}))
            }
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})

//D
app.get('/getAllPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})

//N
app.post('/getUserFavoriteFields', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})



//D
app.post('/getUserFavoritePOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})




//N
app.get('/getAllFields', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})

//D
app.post('/saveFavoraitePOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})



//N
app.post('/getPOIbyID', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})



//D
app.post('/addRating', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})




//N
app.post('/addReview', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})




//D
app.post('/saveFavoraitePOIOrder', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})







