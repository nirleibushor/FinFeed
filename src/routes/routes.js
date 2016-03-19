var express = require('express');
var mainRouter = express.Router();
var mongodb = require('mongodb').MongoClient;

var mongoos = require('mongoose');
var Schema = mongoos.Schema;
var ObjectId = Schema.ObjectId;
var routeUser = mongoos.model('routeUser', new Schema({
    ObjectId: ObjectId,
    userName: String,
    email: {type: String, unique: true},
    password: String
}));

var router = function () {
    mainRouter.route('/').get(function (req, res) {
        var url = 'mongodb://localhost:27017/feedsdb';
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('feeds');
            collection.find({}).toArray(function (err, results) {
                res.render('index', {
                    appFeedsArr: results
                })
            })
        })
    });
    mainRouter.route('/logged').get(function (req, res) {
        var url = 'mongodb://localhost:27017/feedsdb';
        mongodb.connect(url, function (err, db) {
            var collection = db.collection('feeds');
            collection.find({}).toArray(function (err, results) {
                res.render('loggedIndex', {
                    appFeedsArr: results
                })
            })
        })
    });
    mainRouter.route('/login').get(function (req, res) {
        res.render('login');
    });
    mainRouter.route('/feed').get(function (req, res) {
        console.log(req);
        if (req.session && req.session.user){
            routeUser.findOne({email:req.session.user.email}, function (err, user) {
                if (!user) {
                    req.session.reset();
                    res.redirect('/login');
                } else {
                    res.locals.user = user;
                    res.render('feed');
                }
            });
        } else {
            res.redirect('/login');
        }
    });
    mainRouter.route('/settings').get(function (req, res) {
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
    return mainRouter;
};

module.exports = router;