const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// sending emails
const nodeMailer = require('nodemailer');
const sendGrid = require('nodemailer-sendgrid-transport');

const user = require("../models/user");
const SG_API = process.env.SG_API;

const transporter = nodeMailer.createTransport(sendGrid({
    auth: {
        api_key: SG_API
    }
}));

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

    if (!email) {
        req.flash('signupError', 'Please enter an email address.');
        return res.redirect('/signup');
    }

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
                    return transporter.sendMail({
                        to: email,
                        from: 'shop@wallabyDesigns.com',
                        subject: "Sign up successful",
                        html: '<h1>You successfully signed up!</h1>'
                    });
                });
        })
        .catch((err) => {
            console.log(err);
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
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            req.flash('errorLogin', 'There was an error resetting your password.');
            return res.redirect('/reset');
        }
        if (!req.body.email) {
            req.flash('errorLogin', 'Please enter an email address.');
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
                if (location.protocol === 'https:') {
                    connection = "https://cs341-project01.herokuapp.com/reset/";
                }
                res.redirect('/login');
                return transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@wallabyDesigns.com',
                    subject: "Password Reset",
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="${connection + token}">link</a> to set a new password</p> 
                    `
                });
            })
            .catch(err => {
                console.log(err);
            });
    })
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    user.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
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
                passwordToken: token
            });
        })
        .catch(err => {
            console.log(err);
        }); // $gt same as greater than
};

exports.postNewPassword = (req, res, next) => {
    const userID = req.body.userId;
    const passToken = req.body.passToken;
    const pass = req.body.password;
    const conf = req.body.confpassword;
    let resetUser;

    if (pass != conf) {
        req.flash('errorLogin', 'The passwords do not match.');
        return res.redirect('/new-password');
    }

    user.findOne({
            resetToken: token,
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
            return transporter.sendMail({
                to: resetUser.email,
                from: 'shop@wallabyDesigns.com',
                subject: "Password Set",
                html: `
                    <p>Your password was successfully reset!</p>
                `
            });
        })
        .catch(err =>
            console.log(err)
        );

};