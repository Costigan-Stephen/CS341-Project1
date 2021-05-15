const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const mongoConnect = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const prove02Routes = require('./routes/prove02-routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/prove02', prove02Routes);
app.use(shopRoutes);

app.use(errorController.get404);

const corsOptions = {
    origin: "https://cs341-project01.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

mongoConnect((client) => {
    // console.log(client);
    app.listen(PORT);
});
// mongooseConnect((result) => {
// After running mongo and mongoose, listen for port

// });