const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
    MongoClient.connect("mongodb+srv://database-access:yLH4NB0I3UBlIZz4@cluster0.xgeqi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
        .then(client => {
            console.log("Connected!");
            callback(client);
        })
        .catch(err => {
            console.log(err);
        });
}

const mongooseConnect = (callback) => {
    mongoose
        .connect(
            MONGODB_URL, options
        )
        .then(result => {
            app.listen(PORT);
            callback(result);
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = mongoConnect;
module.exports = mongooseConnect;