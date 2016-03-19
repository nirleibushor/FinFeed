var express = require('express');
var passport = require('passport');
var mongodb = require('mongodb').MongoClient;

var authRouter = express.Router();

var router = function () {

    authRouter.route('/signup').post(function (req, res) {
        console.log(req.body);
        var url = 'mongodb://localhost:27017/feedsdb';
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('users');
            var user = {
                username: req.body.email,
                password: req.body.password
            };
            collection.insertOne(user, function (err, results) {
                req.login(results.ops[0], function () {
                    res.redirect('/auth/user-signed-in');
                });
            });
        });
    });

    authRouter.route('/login').post(passport.authenticate('local', {
        successRedirect: 'auth/user-logged-in',
        failureRedirect: '/'
    }));

    authRouter.route('/user-signed-in').get(function (req, res) {
        res.json(req.user);
    });

    authRouter.route('/user-logged-in').get(function (req, res) {
        res.json(req.user);
    });

    return authRouter;
};

module.exports = router;