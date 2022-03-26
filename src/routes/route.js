const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')


// test-api
router.get('/test', function(req, res) {
    res.status(200).send({ status: true, message: "test api working fine" })
})

// 1. create the users
router.post('/register', UserController.createUser)

// 2. Allow an user to login 
router.post('/login', UserController.loginUser)

module.exports = router;