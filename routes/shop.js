const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const { fetchAll } = require('../models/product');

const router = express.Router();

// Product Pages
router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.get('/cart', shopController.getCart);
router.get('/checkout', shopController.getCheckout);

module.exports = router;