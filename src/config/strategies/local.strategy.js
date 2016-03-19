var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

console.log('entered local.strategy.js');

module.exports = function () {
    console.log('entered function in local.strategy.js');
    passport.use(new LocalStrategy({
            userNameField:'email',
            passwordField:'password'},
        function(username, password, done) {
            console.log('entered inner function in local.strategy.js');
            var user = {
                username: username,
                password: password
            };
            done(null, user);
        }));
};

