'use strict';

const bookList = require('../data/books.json'); //(with path)
const bookFields = ["title", "year", "image", "summary"];

module.exports.imageExist = (req, res, next) => {
    var imagePath = "../images/books/";
    if (fs.existsSync("public/images/books/" + req)) {
        res = imagePath + req;
    } else {
        res = imagePath + "404.jpg";
    }
}

module.exports.bookFields = bookFields;
module.exports.bookList = bookList.books;