const path = require('path');
const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const mongoDBStore = require('connect-mongodb-session')(session);
const MONGODBURI = "mongodb+srv://database-user:sNYp6w3xJg3c9NkG@cluster0.fic12.mongodb.net/project1";
const csrf = require('csurf');

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