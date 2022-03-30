const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const BookController = require('../controllers/bookController')

// test-api
router.get('/test', function(req, res) {
    res.status(200).send({ status: true, message: "test api working fine" })
})

// 1. create the users
router.post('/register', UserController.createUser)

// 2. Allow an user to login 
router.post('/login', UserController.loginUser)

// 3. Create a book document
router.post('/books', BookController.createBook)

//4. Returns all books
router.get('/books', BookController.getAllBooks)

//5. Returns a book with ID
router.get('/books/:bookId', BookController.getBookById)

// 6.Update a book 
router.put('/books/:bookId', BookController.updatedBook)

// 7. delete with bookId
router.delete('/books/:bookId', BookController.deleteBookById)

module.exports = router;