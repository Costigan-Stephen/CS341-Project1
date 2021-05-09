const fs = require('fs');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true
    });
};

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title, parseFloat(req.body.price), req.body.description);
    product.save();
    res.redirect('/');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        });
    });
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