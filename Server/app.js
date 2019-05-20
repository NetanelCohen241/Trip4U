var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});



app.post('/login', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})


app.post('/register', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})

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



app.post('/restorePassword', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err)
            res.send(err)
        })
})


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







