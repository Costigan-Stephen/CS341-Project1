const bcrypt = require('bcryptjs');
// const session = require("express-session");
const user = require("../models/user");


exports.getLogin = (req, res, next) => {
    let message = req.flash('errorLogin');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    user.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('errorLogin', 'Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt.compare(pass, user.password)
                .then(match => {
                    if (match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            req.flash('errorLogin', 'Invalid email or password.');
                            res.redirect('/');
                        });
                    } else {
                        // Incorrect password
                        req.flash('errorLogin', 'Invalid email or password.');
                        res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(err);
                    req.flash('errorLogin', 'Invalid email or password.');
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('signupError');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: message
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const conf = req.body.confirmPassword;

    if (pass != conf) {
        req.flash('signupError', 'The passwords do not match.');
        return res.redirect('/signup');
    }

    user.findOne({ email: email })
        .then(userElement => {
            if (userElement) {
                // later, send err message
                req.flash('signupError', 'An account with that email address already exists.');
                return res.redirect('/signup');
            }
            return bcrypt.hash(pass, 12).then(hashedPass => {
                    const newUser = new user({
                        email: email,
                        password: hashedPass,
                        cart: { items: [] }
                    });
                    console.log(newUser);
                    return newUser.save();
                })
                .then(result => {
                    res.redirect('/login');
                });
        })
        .catch((err) => {
            console.log(err);
        });

};