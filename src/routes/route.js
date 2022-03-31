const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const BookController = require('../controllers/bookController')
const ReviewController = require('../controllers/reviewController')
const AuthMiddleWare = require('../middleWare/auth')

// test-api
router.get('/test', function(req, res) {
    res.status(200).send({ status: true, message: "test api working fine" })
})

// 1. create the users
router.post('/register', UserController.createUser)

// 2. Allow an user to login 
router.post('/login', UserController.loginUser)

// 3. Create a book document
router.post('/books', AuthMiddleWare.authentication, BookController.createBook)

//4. Returns all books
router.get('/books', AuthMiddleWare.authentication, BookController.getAllBooks)

//5. Returns a book with ID
router.get('/books/:bookId', AuthMiddleWare.authentication, BookController.getBookById)

// 6.Update a book 
router.put('/books/:bookId', AuthMiddleWare.authentication, AuthMiddleWare.authorization, BookController.updatedBook)

// 7. delete with bookId
router.delete('/books/:bookId', AuthMiddleWare.authentication, AuthMiddleWare.authorization, BookController.deleteBookById)

//8. create the review collection
router.post('/books/:bookId/review', ReviewController.reviewDocument)

//9. Update the review
router.put('/books/:bookId/review/:reviewId', ReviewController.updatedReview)

//10. Delete the related review.
router.delete('/books/:bookId/review/:reviewId', ReviewController.deleteReviewById)

module.exports = router;