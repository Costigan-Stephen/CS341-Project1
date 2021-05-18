const path = require('path');
const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

// products
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);

// cart
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// orders
router.post('/create-order', shopController.postOrder);
router.get('/orders', shopController.getOrders);

module.exports = router;