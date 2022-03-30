const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    excerpt: {
        type: String,
        required: true
    },

    userId: {
        type: ObjectId,
        ref: "User",
        required: true,
        trim: true
    },

    ISBN: {
        type: String,
        required: true,
        unique: true,
        match: /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    subcategory: [{
        type: String,
        required: true,
        trim: true
    }],

    reviews: {
        type: Number,
        default: 0,
        comment: "Holds number of reviews of this book"
    },

    deletedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    releasedAt: {
        type: Date,
        required: true,
        format: /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
    },

}, { timestamps: true })


module.exports = mongoose.model("Book", bookSchema)