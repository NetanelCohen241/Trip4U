var express = require('express');
var app = express();
var cors = require('cors');
var DButilsAzure = require('./DButils');
var authManager = require('./AuthManager');
var fields = { field: ["diners","Museums","Clubs","Shopping"]};
fs = require('fs');

app.use(cors());
var port = 3000;
app.listen(port, function () {
    console.log('Server  listening on port :  ' + port);
});





var bodyParser = require('body-parser');
app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            console.log(err);
            return res.sendStatus(400); // Bad request
        }

        next();
    });
});

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodie


app.use('/getUserFavoriteFields', authManager.validate);
app.use('/getUserFavoritePOI', authManager.validate);
app.use('/saveFavoritePOI', authManager.validate);
app.use('/addRating', authManager.validate);
app.use('/addReview', authManager.validate);
//app.use('/getUserSecurityQuestions', authManager.validate);


//CHECK!
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
            const token = authManager.generateToken(payload, options);
            res.status(200).send(token);

});



app.use('/register',function(req,res,next){

    var parser = require('xml2json');

        fs.readFile('./countries.xml', function (err, data) {
            var json = parser.toJson(data);
            var citesJson = JSON.parse(json)["Countries"]["Country"];
            var cites = [];
            for (const city of citesJson) {
                cites.push(city["Name"]);
            }

            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            var userNameReg = /^[a-zA-Z]*$/;
            var passReg =   /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;
            var userName =req.body.userName;
            var password =req.body.password;
            var email =req.body.email;
            var userNameLen =  3 <= userName.length <= 8 ;
            var passwordLen= 5 <= password.length <= 10 ;
            //check username input
            if(!userNameReg.test(userName) || !userName ){
                res.send("Error in user name");
                return;
            }

            //check password
            if(!passReg.test(password || !password) ){
                res.send('Please enter 5-10 characters and at least one number and one letter in your password');
                return;
            }

            if( !cites.includes(req.body.country) ){
                res.send('country '+ req.body.country+' dose not exist');
                return;
            }
            next();
        });

});

//CHECK!
app.post('/register', function(req, res){
    var fields = "userName, password, firstName, lastName, country, city, email, field1, field2";
    var values = "";
    var count =0;
    for (var param in req.body){
        values+="'"+req.body[param]+"', ";
        count++;
        if(count === 9 ){
            break;
        }
    }
    values = values.substring(0, values.length - 2);
    console.log(values);
    var sql = "INSERT INTO users ("+fields+") VALUES ("+values+");";
    DButilsAzure.execQuery(sql)
        .then(function(result){
            var flds = "userName,questionId, answer";
            var val  ="";
            var qry =
                "INSERT INTO usersSecurityQuestions ("+flds+")\nVALUES\n" ;
            var qustionList = req.body.qustions;
            for (const record of qustionList) {
                val+="('"+req.body.userName+"', '"+record.qustionId+"', '"+record.answer+"'),\n"
            }
            val =val.substr(0,val.length-2)+";";
            qry += val;
            DButilsAzure.execQuery(qry)
                .then(function(result){
                    res.status(201).send("Registration success");
                })
                .catch(function(err){
                    console.log(err);
                    res.status(500).send(err)
                })
        })
        .catch(function(err){
            console.log(err);
            //res.status(500).send(err)
        });


});


//CHECK!!
app.post('/getUserFavoritePOI', function(req, res){
    var userName = req.body.userName;
    DButilsAzure.execQuery( "SELECT m.poiId,poi.name,poi.field,poi.description,poi.rank,poi.views,poi.imageUrl "+
                                 "FROM (SELECT poiId "+
                                 "FROM usersFavoritePOI "+
                                 "WHERE userName = '"+userName+"') as m, pointsOfInterest as poi "+
                                 "WHERE m.poiId = poi.poiId")
   .then(function(result){
       if(result.length === 0 ){
           res.status(200).send("User dose not exist or dont have a Favorite list");
       }else {
           res.status(200).send(result);
       }
    })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});




//CHECK!
app.get('/getSecurityQuestions', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM securityQuestions")
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});


app.post('/getUserSecurityQuestions', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM usersSecurityQuestions left join securityQuestions" +
                                    " on usersSecurityQuestions.questionId = securityQuestions.questionId " +
                                    "WHERE userName= '"+req.body['userName']+"'")
        .then(function(result){
            if(result.length === 0)
                res.send(JSON.stringify({response: "user does not exists"}));
            else {
                // var firstQuestion = "", secondQuestion = "";
                // var numOfRecords = result.length;
                // var index = Math.floor(Math.random() * numOfRecords);
                // firstQuestion = result[index]["question"];
                // result.remove(index);
                // secondQuestion = Math.floor(Math.random() * (numOfRecords - 1));
                res.status(200).send(result);
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});



//CHECK!
app.post('/restorePassword', function(req, res){
    var sql = "SELECT * FROM usersSecurityQuestions WHERE userName= '"+req.body['userName']+
        "' and questionId= "+req.body["questionId"];
    DButilsAzure.execQuery(sql)
        .then(function(result){
            if(result.length === 0)
                res.send(JSON.stringify({response: "user does not exists"}));
            else {
                var user = result[0];
                if(user['answer'] === req.body['answer']){
                    DButilsAzure.execQuery("SELECT * FROM users WHERE userName= '"+req.body['userName']+"'")
                        .then(function (result) {
                            res.status(200).send({password: result[0]['password']});
                        })
                        .catch(function(err){
                            console.log(err);
                            res.status(500).send(err)
                        })
                }
                else
                    res.status(401).send(JSON.stringify({response: "Wrong answer"}))
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err)
        })
});



//CHECK!!
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





//CHECK!
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

    res.status(200).send(JSON.stringify(fields))

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
//CHECK with
app.post('/saveFavoritePOI', function(req, res){
    saveFavoritePOI(req.body.userName, req.body.favorite);
    res.status(201).send("OK");


});



//CHECK!
app.post('/getPOIbyID', function(req, res){
    DButilsAzure.execQuery("SELECT * FROM pointsOfInterest WHERE poiId='"+ req.body['poiId']+"'")
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});



//CHECK!
app.post('/incrementPOIViewsNumber', function(req, res){
    var sql = "UPDATE pointsOfInterest SET views = views +1 WHERE poiId = "+req.body['poiId'];
    DButilsAzure.execQuery(sql)
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.status(500).send(err);
        })
});

//CHECK!

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
        return true;
    }catch(err) {
        return false;

    }

}


app.post('/addRating', function(req, res){
    let userName = req.body.userName;
    let poiId = req.body.poiId;
    let rating = req.body.rank;
    let response = addRating(userName, poiId, rating);
    response.then(function (response) {

        if(response)
            res.status(201).send("Success");
        else
            res.status(201).send("fail");
    }).catch()


});




//CHECK!
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




//CHECK!
app.get('/getPopularPOIbyRating', function(req, res){
    var sql = "SELECT * FROM pointsOfInterest WHERE rank>="+req.body['rank'];
    DButilsAzure.execQuery(sql)
        .then(function(result){
            var ans = []
            var numOfRecords = result.length;
            for (var i = 0; i < Math.min(req.body['amount'],numOfRecords); i++) {
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







