const express = require('express');
const fs = require('fs'); // File system for TA01
const router = express.Router();

'use strict';

const bookList = require('../data/books.json'); //(with path)
const bookFields = ["title", "year", "image", "summary"];

function imageExist(url) {
    var imagePath = "../images/books/";
    if (fs.existsSync("public/images/books/" + url)) {
        return imagePath + url;
    } else {
        return imagePath + "404.jpg";
    }
}

router.get('/', (req, res, next) => {
    res.render('./shop/prove02', {
        pageTitle: 'Prove Assignment 02',
        bookList: bookList.books,
        bookFields: bookFields,
        imageExist: imageExist,
        path: '/prove02'
    });
    return res.end();
});

router.post('/addBook', (req, res, next) => {
    var bookId = bookList.length;
    var newBook = { "id": bookId, "title": req.body.title, "year": parseInt(req.body.year), "image": req.body.image, "summary": req.body.summary };
    bookList.books.push(newBook);
    fs.writeFile('./data/books.json', JSON.stringify(bookList), 'utf8', function(err) {
        if (err) throw err;
        console.log('File updated');
    });
    res.redirect("/prove02/");
});

module.exports = router;