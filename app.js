const path = require('path');
const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000

const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const mongoDBStore = require('connect-mongodb-session')(session);
const MONGODBURI = "mongodb+srv://database-user:sNYp6w3xJg3c9NkG@cluster0.fic12.mongodb.net/project1";
// const mongoConnect = require('./util/database').mongoConnect;

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

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

app.use((req, res, next) => {
    User.findById('60a0b694c695c6bdf0f9e924')
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
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Steve',
                    email: 'steve@domain.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(PORT);
    })
    .catch(err => {
        console.log(err);
    });