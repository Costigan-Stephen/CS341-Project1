const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'books.json'
);

const getBooksFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

const imageExist = cb => {
    var imagePath = "../images/books/";
    if (fs.existsSync("public/images/books/" + cb)) {
        return imagePath + cb;
    } else {
        return imagePath + "404.jpg";
    }
}

module.exports = class Books {
    constructor(t) {
        this.title = t;
    }

    save() {
        getBooksFromFile(books => {
            books.push(this);
            fs.writeFile(p, JSON.stringify(books), err => {
                console.log(err);
            });
        });
    }

    static fetchBooks(cb) {
        getBooksFromFile(cb);
    }
};