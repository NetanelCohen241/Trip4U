var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");


var secret = "mySecret"
var port = 3000;
app.listen(port, function () {
    console.log('Server  listening on port :  ' + port);
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodie


app.use('/login', function(req, res ,next){
    DButilsAzure.execQuery("SELECT * FROM users")
        .then(function(result){
            var users = result;
            var userRequestData = req.body;
            for (const user of users) {
                if(user["userName"] === userRequestData["userName"] ){
                    if(user["password"] === userRequestData["password"] ){
                        next();
                        return;
                    }
                }
            }
            //401 mean unauthorized user
                res.status(401).send("incorrect userName or password")
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});

app.post('/login', function(req, res){

            let payload = {userName: req.body.userName };
            let options = {expiresIn: "1d"};
            const token = jwt.sign(payload,secret, options);
            res.status(200).send(token);

});



//N
app.post('/register', function(req, res){
    var fields = "userName, password, firstName, lastName, country, city, email, field1, field2, questionForPassword, answer";
    var values = "";
    for (var param in req.body){
        values+="'"+req.body[param]+"', ";
    }
    values = values.substring(0, values.length - 2);
    console.log(values);
    var sql = "INSERT INTO users ("+fields+") VALUES ("+values+");";
    DButilsAzure.execQuery(sql)
        .then(function(result){
            res.status(201).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});


//D
app.post('/getUserFavoritePOI', function(req, res){
    var userName = req.body.userName;
    DButilsAzure.execQuery( "SELECT m.poiId,poi.name,poi.field,poi.description,poi.rank,poi.views "+
                                 "FROM (SELECT poiId "+
                                 "FROM usersFavoritePOI "+
                                 "WHERE userName = '"+userName+"') as m, pointsOfInterest as poi "+
                                 "WHERE m.poiId = poi.poiId")
   .then(function(result){
        res.status(200).send(result);
    })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});




//D
app.post('/getSecurityQuestion', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM users")
        .then(function(result){
            var user_question = "";
            for (const user of result) {
                if(user["userName"] === req.body.userName){
                    user_question = user["questionForPassword"];
                    var ans = { "qustion": user_question};
                    res.send(JSON.stringify(ans));
                    return;
                }
            }

            //doesn't find any content following the criteria given by the user agent.
            res.status(406).send(JSON.stringify({Error: "cant find question"} ));
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});

//N
app.post('/restorePassword', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM users WHERE userName="+req.body['userName'])
        .then(function(result){
            if(result.length === 0)
                res.send(JSON.stringify({response: "user does not exists"}))
            else {
                var user = result[0];
                if(user['answer'] === req.body['answer'])
                    res.status(200).send(JSON.stringify({password: user['password']}))
                else
                    res.status(401).send(JSON.stringify({response: "Wrong answer"}))
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});

//D
app.get('/getAllPOI', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM pointsOfInterest")
        .then(function(result){
            res.status(200).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});





//N
app.post('/getUserFavoriteFields', function(req, res){
    DButilsAzure.execQuery("SELECT field1,field2 FROM users WHERE userName='"+ req.body['userName']+"'")
        .then(function(result){
            res.status(200).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});




//N
app.get('/getAllFields', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM tableName")
        .then(function(result){
            res.status(200).send(result)
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});


async function saveFavoritePOI(userName,records) {
    try {
        let qry = "DELETE FROM usersFavoritePOI WHERE userName = '"+userName+"';";
        await DButilsAzure.execQuery(qry);
        qry =
            "INSERT INTO usersFavoritePOI ( userName , poiId, timeStamp, poiIndex )\nVALUES\n" ;
        let  values="" ;
        for (const record of records) {
            values+="('"+userName+"', '"+record.poiId+"', '"+record.timeStamp+"', "+record.poiIndex+"),\n"
        }
        values =values.substr(0,values.length-2)+";";
        qry += values;;
        await DButilsAzure.execQuery(qry);


    }catch (e) {
        console.log(e);
        res.status(500).send(e);

    }

}
//D
app.post('/saveFavoraitePOI', function(req, res){
    saveFavoritePOI(req.body.userName, req.body.favorite);
    res.status(201).send("OK");


});



//N
app.post('/getPOIbyID', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM pointsOfInterest WHERE poiId="+ req.body['poiId'])
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});



//D

async function addRating(userName,poiId,rating){
    try {
        let qry = "SELECT *" + "FROM usersReviewOnPOI " + "WHERE userName =  '" + userName +  "' and poiId = '" + poiId + "';";
        let numberOfRecords = await DButilsAzure.execQuery(qry);
        numberOfRecords = numberOfRecords.length;
        if (numberOfRecords > 0) {
            qry = "UPDATE  usersReviewOnPOI " + "SET rank = " + rating + " " + "WHERE userName =  '" + userName + "' and poiId = '" + poiId + "';";
            await DButilsAzure.execQuery(qry);
        } else {
            qry = "INSERT INTO usersReviewOnPOI (userName, poiId, review,rank) " + "VALUES ('" + userName + "'," + poiId + ", NULL ," + rating + ");";
            await DButilsAzure.execQuery(qry);
        }
         qry = "SELECT AVG(cast (rank as Float)) as avg " +
            "FROM usersReviewOnPOI " +
            "WHERE poiId = '" + poiId + "';";
        const tmp = await DButilsAzure.execQuery(qry);
        let avg = tmp[0].avg;
        qry = "UPDATE  pointsOfInterest " + "SET rank = " + avg + " " + "WHERE poiId =  '" + poiId +"';";
        await DButilsAzure.execQuery(qry);
    }catch (e) {
        console.log(e);

    }

}
app.post('/addRating', function(req, res){
    let userName = req.body.userName;
    let poiId = req.body.poiId;
    let rating = req.body.rank;
    addRating(userName,poiId,rating)
        .then(res.status(201).send("Success"))
        .catch(function (err){
            res.status(500).send(err);
        });
});




//N
app.post('/addReview', function(req, res){

    var fields = "userName,poiId,review,rank";
    var values = "";
    for (var param in req.body){
        values+="'"+req.body[param]+"', ";
    }
    values += "null";
    var sql = "SELECT * FROM usersReviewOnPOI WHERE userName='"+req.body['userName']+"' and poiId="+req.body['poiId']+";"
    DButilsAzure.execQuery(sql)
        .then(function(result){
            if(result.length === 0){
                sql = "INSERT INTO usersReviewOnPOI ("+fields+") VALUES ("+values+");"
                DButilsAzure.execQuery(sql)
                    .then(function (result) {
                        res.status(200).send("success")
                    })
                    .catch(function(err){
                        console.log(err);
                        res.status(500).send(err);
                    })
            }
            else{
                sql = "UPDATE usersReviewOnPOI SET review ='"+req.body['review']+
                      "' WHERE userName='"+req.body['userName']+"' and poiId="+req.body['poiId']+";"
                DButilsAzure.execQuery(sql)
                    .then(function (result) {
                        res.status(200).send("success")
                    })
                    .catch(function(err){
                        console.log(err);
                        res.status(500).send(err)
                    })
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});




//D
app.get('/getPopularPOIbyRating', function(req, res){
    var sql = "SELECT * FROM pointsOfInterest WHERE rank>="+req.body['rank'];
    DButilsAzure.execQuery(sql)
        .then(function(result){
            var ans = []
            var numOfRecords = result.length;
            for (var i = 0; i < req.body['amount']; i++) {
                var rnd = Math.floor(Math.random() * numOfRecords);
                if(ans.includes(result[rnd]))
                    i--;
                else
                    ans.push(result[rnd])
            }
            res.send(ans)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});







