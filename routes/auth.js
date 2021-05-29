const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const user = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post(
    '/login', [
        check('email', 'Please enter a valid email address')
        .isEmail()
        .custom((chkemail, { req }) => {
            const userElement = user.findOne({ email: chkemail });
            if (!userElement) {
                return Promise.reject('Invalid email or password.');
            }
        })
    ], [
        body('password', 'Please enter a password with at least 6 characters')
        .isLength({ min: 6 })
    ],
    authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup', [
        check('email', 'Please enter a valid email address')
        .isEmail()
        .custom((chkemail, { req }) => {
            return user.findOne({ email: chkemail })
                .then(userElement => {
                    console.log(userElement);
                    if (userElement) {
                        return Promise.reject('An account with that email address already exists.');
                    }
                });
        })
    ], [
        body('password', 'Please enter a password with at least 6 characters')
        .isLength({ min: 6 }),
        body('confirmPassword').custom((confirm, { req }) => {
            if (confirm !== req.body.password) {
                throw new Error('The passwords do not match!');
            }
            return true;
        })
    ],
    authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset',
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
    authController.postReset
);

router.get('/reset/:token', authController.getNewPassword);

router.post(
    '/new-password',
    body('confpassword').custom((confirm, { req }) => {
        if (confirm !== req.body.password) {
            throw new Error('The passwords do not match!');
        }
        return true;
    }),
    authController.postNewPassword
);


module.exports = router;