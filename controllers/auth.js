const bcrypt = require('bcryptjs');
// const session = require("express-session");
const user = require("../models/user");


exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login'
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;

    user.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.redirect('/login');
            }
            bcrypt.compare(pass, user.password)
                .then(match => {
                    if (match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    } else {
                        // Incorrect password
                        res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log(err);
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
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const conf = req.body.confirmPassword;

    user.findOne({ email: email })
        .then(userElement => {
            if (userElement) {
                // later, send err message
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