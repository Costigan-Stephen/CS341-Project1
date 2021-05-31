const session = require("express-session");

exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.get500 = (req, res, next) => {
    if (req.session) {
        let isLoggedIn = req.session.isLoggedIn;
    } else {
        let isLoggedIn = '';
    }
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isLoggedIn: req.session.isLoggedIn
    });
};