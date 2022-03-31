const { default: mongoose } = require('mongoose')
const ReviewModel = require('../models/reviewModel')
const BookModel = require('../models/bookModel')
const ObjectId = mongoose.Types.ObjectId

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

// 8. create review collection===========================================================
const reviewDocument = async function(req, res) {
    try {
        const data = req.body;
        let { bookId, reviewedBy, reviewedAt, rating, review, } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "request body is empty ,BAD REQUEST" })
        }
        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is not valid" })
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: '${bookId} is not a valid book Id' })
        }
        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, message: "reviewed By is required" })
        }
        if (data.hasOwnProperty('reviewedAt')) {
            if (!isValid(reviewedAt)) {
                return res.status(400).send({ status: false, message: "reviewedAt is required" })
            }
        }
        if (data.hasOwnProperty('reviewedAt')) {
            if (!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(reviewedAt))) {
                return res.status(400).send({ status: false, msg: "date should be in format, YYYY-MM-DD " })
            }
        }
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: "rating is required" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).send({ status: false, msg: "rating should be in number from 1 to 5 only" })
        }
        if (data.hasOwnProperty('review')) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, msg: "review should ba a valid" })
            }
        }
        let bookDetails = await BookModel.find({ _id: bookId, isDeleted: false })
        if (!bookDetails) {
            return res.status(400).send({ status: false, msg: "no book exist with this bookId" })
        } else {
            let reviewCreated = await ReviewModel.create(data)
            let increaseBookReview = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { review: 1 } })
            return res.status(201).send({ status: true, data: reviewCreated })
        }

    } catch (error) {
        console.log("This is the error:", error.message)
        res.status(500).send({ msg: "server error", err: error })
    }
}

//9. Update the review======================================================================================
const updatedReview = async function(req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let data = req.body

        let { review, rating, reviewerName } = data
        let reviewToBeUpdated = {}

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "to update the data request body can't be empty , BAD REQUEST" })
        }
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId is not a valid objectId" })
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "reviewId is not a valid objectId" })
        }
        if (isValid(review)) {
            reviewToBeUpdated.review = review
        }
        if (isValid(rating) && (rating < 1 || rating > 5)) {
            reviewToBeUpdated.rating = rating
        }
        if (isValid(reviewerName)) {
            reviewToBeUpdated.reviewedBy = reviewerName
        }
        let bookDetails = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookDetails) {
            return res.status(404).send({ status: "book not exist with this bookId" })
        }
        let reviewDetails = await ReviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewDetails) {
            return res.status(404).send({ status: false, msg: "reviews not exist with this reviewId" })
        } else {
            let updatedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, reviewToBeUpdated, { new: true })
            let reviewDetails = await ReviewModel.find({ bookId: bookDetails._id, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
            let bookData = bookDetails.toObject()
            bookData.reviewsData = reviewDetails
            return res.status(201).send({ status: true, msg: "review updated successfully", numberOfReviews: reviewDetails.length, data: bookData })
        }

    } catch (error) {
        console.log("This is the error:", error.message)
        res.status(500).send({ msg: "server error", err: error })
    }
}

// 10. deleted review================================================================================================
const deleteReviewById = async function(req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "bookId is not a valid objectId" })
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "reviewId is not a valid ObjectId" })
        }
        let bookDetails = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookDetails) {
            return res.status(404).send({ status: false, msg: "book not exist with this bookId" })
        }
        let reviewDetails = await ReviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewDetails) {
            return res.status(404).send({ status: false, msg: "review not exist with this reviewId" })
        } else {
            let reviewToBeDeleted = await ReviewModel.updateMany({ _id: reviewId, isDeleted: false }, { $set: { isDeleted: true } })
            let bookReviewToBeDeleted = await BookModel.updateMany({ _id: reviewDetails.bookId }, { $inc: { reviews: -1 } })
            return res.status(201).send({ status: true, msg: "review deleted successfully" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}


module.exports.reviewDocument = reviewDocument
module.exports.updatedReview = updatedReview
module.exports.deleteReviewById = deleteReviewById