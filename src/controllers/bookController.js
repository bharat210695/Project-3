const { default: mongoose } = require('mongoose')
const BookModel = require('../models/bookModel')
const UserModel = require('../models/userModel')
const ReviewModel = require('../models/reviewModel')
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


3. // Create a book document
const createBook = async function(req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide books details in body" })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, reviews, isDeleted, releasedAt } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Book title is required" })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "Book excerpt is required" })
        }

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: '${userId} is not a valid user Id' })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "Book ISBN is required" })
        }

        if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))) {
            return res.status(400).send({ status: false, message: "ISBN type is not valid" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "Book category is required" })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "Book subcategory is required" })
        }

        if (!isValid(reviews)) {
            return res.status(400).send({ status: false, message: "Book review is required" })
        }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt is required" })
        }

        if (!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(releasedAt))) {
            return res.status(400).send({ status: false, message: "data is not in the formate of YYYY-MM-DD" })
        }

        const isTitleAlreadyUsed = await BookModel.findOne({ title })
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "title is already used" })
        }

        const isIsbnAlreadyUsed = await BookModel.findOne({ ISBN })
        if (isIsbnAlreadyUsed) {
            return res.status(400).send({ status: false, message: "ISBN no. is already used" })
        }


        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).send({ status: false, message: "user does not exist" })
        }

        if (isDeleted == true) {
            const bookData = {
                title,
                excerpt,
                userId,
                ISBN,
                category,
                subcategory,
                isDeleted: isDeleted ? isDeleted : false,
                deletedAt: isDeleted ? new Date() : null
            }

            const newBook = await BookModel.create(bookData)
            res.status(201).send({ status: true, message: "Success", data: newBook })
        } else {
            const newBook = await BookModel.create(requestBody)
            return res.status(201).send({ status: true, data: newBook })
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }

}

// 4. Returns all books in the collection
const getAllBooks = async function(req, res) {
    try {
        const data = req.query
        const { userId, category, subcategory } = data

        const filterQuery = { isDeleted: false }

        if (isValid(userId) && isValidObjectId(userId)) {
            filterQuery['userId'] = userId
        }

        if (isValid(category)) {
            filterQuery['category'] = category
        }

        if (isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory
        }

        const filteredBooks = await BookModel.find(filterQuery)
            .select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })

        if (Object.keys(filteredBooks).length == 0) {
            return res.status(404).send({ status: false, message: "no books exist with this filter" })

        } else {
            res.status(200).send({ status: true, NumberOfBooks: filteredBooks.length, message: "Success", data: filteredBooks })
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

// 5. Returns a book with complete details including reviews

const getBookById = async function(req, res) {
    try {
        let bookId = req.params.booksId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is not a valid objectId" })
        }
        let bookDetails = await BookModel.findOne({ _id: bookId, isDeleted: false })

        if (!bookDetails) {
            return res.status(404).send({ status: false, message: "no book exist with this bookId" })
        } else {
            let reviewDetails = await ReviewModel.find({ bookId: bookDetails._id, isDeleted: false })
                .select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, reviews: 1 })
            let bookData = bookDetails.toObject()
            bookData.reviewsData = reviewDetails
            return res.status(200).send({ status: true, NumberOfReviews: reviewDetails.length, data: bookData })
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message })
    }
}


// 6. Update a book 
const updatedBook = async function(req, res) {
    try {
        let data = req.body
        let bookId = req.params.bookId
        let { title, excerpt, releaseDate, ISBN } = data
        let booksToBeUpdated = {}

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "body can't be empty, provide valid data for update" })
        }
        if (isValid(title)) {
            booksToBeUpdated.title = title
        }
        if (isValid(excerpt)) {
            booksToBeUpdated.excerpt = excerpt
        }
        if (isValid(releaseDate)) {
            booksToBeUpdated.releaseDate = releaseDate
        }
        if (data.hasOwnProperty('releaseDate')) {
            if (!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(releaseDate))) {
                return res.status(400).send({ status: false, message: "release date should be in this format(YYYY-MM-DD)" })
            }
        }

        if (isValid(ISBN)) {
            booksToBeUpdated.ISBN = ISBN
        }
        if (data.hasOwnProperty('ISBN')) {
            if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN))) {
                return res.status(400).send({ status: false, message: "please enter a valid ISBN no. for update" })
            }
        }

        let isTitleAlreadyUsed = await BookModel.findOne({ title })
        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: "title is already used" })
        }

        let isIsbnAlreadyUsed = await BookModel.findOne({ ISBN })
        if (isIsbnAlreadyUsed) {
            return res.status(400).send({ status: false, message: "ISBN no is already used" })
        }

        let bookDetails = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookDetails) {
            res.status(404).send({ status: false, message: "book does not exist with this bookId" })
        } else {
            let updatedBookDetails = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, booksToBeUpdated)
            return res.status(200).send({ status: false, data: updatedBookDetails, message: "Success" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


// 7. Check if the bookId exists and is not deleted
const deleteBookById = async function(req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId) {
            return res.status(400).send({ status: false, message: "bookId is required" })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "bookId is invalid" })
        }

        let markDelete = await BookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, message: "Deletion is done", data: markDelete })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




module.exports.createBook = createBook
module.exports.getAllBooks = getAllBooks
module.exports.getBookById = getBookById
module.exports.updatedBook = updatedBook
module.exports.deleteBookById = deleteBookById