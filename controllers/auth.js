const session = require("express-session");

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isLoggedIn: session.isLoggedIn
    });
};

exports.postLogin = (req, res, next) => {
    session.isLoggedIn = true;
    res.redirect('/');
};

exports.postLogout = (req, res, next) => {
    session.isLoggedIn = false;
    res.redirect('/');
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        isLoggedIn: session.isLoggedIn
    });
};

exports.postSignup = (req, res, next) => {};