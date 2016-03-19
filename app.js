var express = require('express');
var bodyParser = require('body-parser');
var session = require('client-sessions');

var app = express();
app.locals.pretty = true;
var port = process.env.PORT || 5000;
var mongodb = require('mongodb').MongoClient;

var mongoos = require('mongoose');
var Schema = mongoos.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoos.model('User', new Schema({
    ObjectId: ObjectId,
    userName: String,
    email: {type: String, unique: true},
    password: String,
    stocksCat: Boolean,
    nationalCat:Boolean,
    enterCat: Boolean
}));

mongoos.connect('mongodb://localhost/feedsdb/users');

app.use(express.static('public'));
app.set('views', './src/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    cookieName: 'session',
    secret: 'nirleibushor',
    durations: 30*60*1000,
    activeDuration: 5*60*1000
}));

// ******** posts ******** //
app.post('/auth/signup', function (req, res) {
    var user = new User({
       userName: req.body.userName,
       email: req.body.email,
       password: req.body.password,
       stocksCat: true,
       nationalCat: true,
       enterCat: true
   });
    user.save(function (err) {
        if(err){
            var err = 'Error! try again';
            if (err.code = 11000) {
                error = 'this email address is taken, try another one';
            }
            res.redirect('/login');
        } else {
            req.session.user = user;
            res.redirect('/');
        }
    });
});

app.post('/auth/login', function (req, res) {
    User.findOne({email: req.body.email}, function (err, user) {
        if (!user) {
            res.redirect('/login');
        } else {
            if (req.body.password === user.password) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        }
    });
});

app.post('/adjust-profile-settings', function (req, res) {
    console.log('national: %s, stocks: %s, enter: %s', req.body.national, req.body.stocks, req.body.enter);
    User.findOne({email: req.session.user.email}, function (err, user) {
        if (!user) {
            res.redirect('/login');
        } else {
            if (typeof req.body.national === 'undefined') {
                User.update({_id: user._id}, {
                    nationalCat: false
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }else{
                User.update({_id: user._id}, {
                    nationalCat: true
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }
            if (typeof req.body.stocks === 'undefined') {
                User.update({_id: user._id}, {
                    stocksCat: false
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }else{
                User.update({_id: user._id}, {
                    stocksCat: true
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }
            if (typeof req.body.enter === 'undefined') {
                User.update({_id: user._id}, {
                    enterCat: false
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }else{
                User.update({_id: user._id}, {
                    enterCat: true
                }, function(err, affected, resp) {
                    console.log(resp);
                })
            }
            res.redirect('/');
        }
    });
});

// ******** views ******** //
app.get('/', function (req, res) {
    var url = 'mongodb://localhost:27017/feedsdb';
    var mongodb = require('mongodb').MongoClient;
    mongodb.connect(url, function (err, db) {
        var collection = db.collection('feeds');
        collection.find({}).toArray(function (err, results) {
            if (req.session && req.session.user) {
                res.render('loggedIndex', {
                    appFeedsArr: results,
                    logged: true,
                    userName: req.session.user.userName
                });
            } else {
                res.render('index', {
                    appFeedsArr: results,
                    logged: false
                });
            }
         })
    })
});


app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/settings', function (req, res) {
    if (req.session && req.session.user){
        User.findOne({email:req.session.user.email}, function (err, user) {
            if (!user) {
                req.session.reset();
                res.redirect('/login');
            } else {
                res.locals.user = user;
                res.render('settings');
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/feed', function (req, res) {
    if (req.session && req.session.user){
        User.findOne({email:req.session.user.email}, function (err, user) {
            if (!user) {
                req.session.reset();
                res.redirect('/login');
            } else {
                res.locals.user = user;
                var conditions = [];
                if (user.nationalCat){
                    conditions.push({national: user.nationalCat});
                }
                if (user.stocksCat){
                    conditions.push({stocks: user.stocksCat});
                }
                if (user.enter){
                    conditions.push({enter: user.enterCat});
                }
                console.log('conditions:\n', conditions);
                var url = 'mongodb://localhost:27017/feedsdb';
                var mongodb = require('mongodb').MongoClient;
                mongodb.connect(url, function (err, db) {
                    var collection = db.collection('feeds');
                    collection.find({$or: conditions}).toArray(function (err, results) {
                        if (typeof results === 'undefined'){
                            results = [];
                        }
                        res.render('feed', {
                            appFeedsArr: results,
                            logged: true,
                            userName: req.session.user.userName
                        });
                    })
                })
            }
        });
    } else {
        res.redirect('/login');
    }
});

// ******** admin pages ******** //
var feeds = require('./admin-init-feeds-db.js');

app.get('/admin-init-feeds-db', function(req, res){
    var url = 'mongodb://localhost:27017/feedsdb';
    mongodb.connect(url, function (err, db){
       var collection = db.collection('feeds');
        collection.insertMany(feeds, function (err, result) {
            res.send(result);
            db.close();
        });
    });
});

// listen //
app.listen(port, function(err){
    console.log('running server in port ' + port);
});
