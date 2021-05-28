require('custom-env').env('staging');
require('dotenv').config();
const path = require('path');
const PORT = process.env.PORT || 5000;

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const mongoDBStore = require('connect-mongodb-session')(session);
const MONGODBURI = process.env.MONGODB_URL;
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

const csurfAuth = csrf();
const store = new mongoDBStore({
    uri: MONGODBURI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const prove02Routes = require('./routes/prove02-routes');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'ThisShouldBeALongerString',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csurfAuth);
app.use(flash());

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfAuth = req.csrfToken();
    next();
});

console.log(MONGODBURI);

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(prove02Routes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(MONGODBURI)
    .then(result => {
        app.listen(PORT);
    })
    .catch(err => {
        console.log(err);
    });