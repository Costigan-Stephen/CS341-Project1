const bcrypt = require('bcryptjs');
const crypto = require('crypto');

require('custom-env').env('staging');
const SG_API = process.env.SG_API;
const SG_EMAIL = process.env.SG_EMAIL;
const LOCATION = process.env.LOCATION;

const { validationResult, body } = require('express-validator/check');

// sending emails
const transporter = require('@sendgrid/mail')
transporter.setApiKey(SG_API);

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
        errorMessage: message,
        oldInput: {
            email: "",
            password: ""
        },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
                email: email,
                password: pass
            },
            validationErrors: errors.array()
        });
    }
    user.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password.');
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: pass
                    },
                    validationErrors: errors.array()
                });
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
                        return res.status(422).render('auth/login', {
                            path: '/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password.',
                            oldInput: {
                                email: email,
                                password: pass
                            },
                            validationErrors: errors.array()
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: pass
                        },
                        validationErrors: errors.array()
                    });
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
        isLoggedIn: false,
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const pass = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isLoggedIn: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: pass,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        });

    }

    bcrypt.hash(pass, 12).then(hashedPass => {
            const newUser = new user({
                email: email,
                password: hashedPass,
                cart: { items: [] }
            });
            return newUser.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.send({
                to: email,
                from: SG_EMAIL,
                subject: "Sign up successful",
                html: '<h1>You successfully signed up!</h1>'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getReset = (req, res, next) => {
    let message = req.flash('errorLogin');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
        oldInput: {
            email: "",
        },
        validationErrors: []
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            req.flash('errorLogin', 'There was an error resetting your password.');
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        user.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('errorLogin', 'That email address is invalid.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 1800000; // 30 minutes
                return user.save();
            })
            .then(result => {
                var connection = "http://localhost:5000/reset/";
                if (LOCATION === 'online') {
                    connection = "https://cs341-project01.herokuapp.com/reset/";
                }
                res.redirect('/login');
                return transporter.send({
                    to: req.body.email,
                    from: SG_EMAIL,
                    subject: "Password Reset",
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="${connection + token}">link</a> to set a new password</p> 
                    `
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    })
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    //                                                        $gt same as greater than
    user.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.redirect('/reset');
            }

            let message = req.flash('errorLogin');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Update Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
                oldInput: {
                    password: "",
                    confirmPassword: ""
                },
                validationErrors: []
            });
        })

    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
    const userID = req.body.userId;
    const passToken = req.body.passToken;
    const pass = req.body.password;
    const errors = validationResult(req);
    let resetUser;

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Update Password',
            errorMessage: errors.array()[0].msg,
            userId: userID,
            passwordToken: passToken,
            oldInput: {
                password: pass,
                confirmPassword: req.body.confPassword
            },
            validationErrors: errors.array()
        });
    }

    user.findOne({
            resetToken: passToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userID
        })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(pass, 12);
        })
        .then(newpass => {
            resetUser.password = newpass;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.send({
                to: resetUser.email,
                from: SG_EMAIL,
                subject: "Password Set",
                html: `
                    <p>Your password was successfully reset!</p>
                `
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};