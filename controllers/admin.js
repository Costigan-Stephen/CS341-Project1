const fs = require('fs');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
    });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
        });
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const image = req.body.image;
    const description = req.body.description;
    const product = new Product(title, parseFloat(price), description, image);
    product.save();
    res.redirect('/');
};

exports.deleteProduct = (req, res, next) => {
    const id = req.params.id;
    const userArray = JSON.parse(JSON.stringify(require("../data/products.json")));
    // Splice method removes from a const array
    if (id !== -1) {
        if (userArray.length == 1) {
            fs.unlinkSync('data/products.json')
        } else {
            userArray.splice(id, 1);
            fs.writeFile('data/products.json', JSON.stringify(userArray), 'utf8', function(err) {
                if (err) throw err;
            });
        }
    }
    res.redirect('/');
}