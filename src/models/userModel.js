const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ["Mr", "Mrs", "Miss"],
        required: true
    },

    name: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        unique: true,
        match: [/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 'Please fill a valid phone number'],
        required: true,
    },

    email: {
        type: String,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        required: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/, 'Please fill a valid password'],
        trim: true
    },

    address: {
        street: String,
        city: String,
        pincode: String
    },

}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)