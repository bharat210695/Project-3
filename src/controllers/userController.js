const UserModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidTitle = function(title) {
    return ['Mr', 'Mrs', "Miss"].indexOf(title) !== -1
}


// 1. create user document==============================================
const createUser = async function(req, res) {

    try {
        let data = req.body

        let { title, name, email, phone, password } = data

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "request body is empty ,BAD REQUEST" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "title is required" })
        }
        if (!isValidTitle(title)) {
            return res.send(400).send({ status: false, msg: "title should be among Mr,Mrs,Miss" })
        }
        if (!isValid(name)) {
            return res.send(400).send({ status: false, msg: "name is required" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "email is required" })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "emailId is not a valid emailId" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "phone is required" })
        }
        if (!(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, msg: "phone no. is not a valid phone no." })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }
        if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "password length must be in between 8 to 15 and must contain atleast one number and uppercase and lowercase letter" })
        }

        isPhoneAlreadyUsed = await UserModel.findOne({ phone })
        if (isPhoneAlreadyUsed) {
            return res.status(400).send({ status: false, msg: " phone no. is already used, please provide another phone no." })
        }
        isEmailAlreadyUsed = await UserModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: " emailId is already used, please provide another emailId" })
        } else {
            let userCreated = await UserModel.create(data)
            return res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}


// Allow an user to login with their email and password=======================================================
const loginUser = async function(req, res) {

    try {
        let email = req.body.email
        let password = req.body.password

        if ((!isValid(email)) && (!isValid(password))) {
            return res.status(400).send({ msg: " email and password is required " })
        } else {
            let createdUser = await UserModel.findOne({ email: email, password: password })
            if (!createdUser)
                return res.status(404).send({ msg: "Cannot login as userName and password not matched" });
            let iat = Math.floor(Date.now() / 1000)
            let token = jwt.sign({ userId: createdUser._id, exp: iat + (60 * 30) }, "project-3_group-9")
            res.setHeader("x-auth-token", token);
            res.status(201).send({ msg: " loged in successfully", data: token })
        }
    } catch (error) {
        console.log("This is the error:", error.message)
        res.status(500).send({ msg: "server error", err: error })
    }

}

module.exports.createUser = createUser
module.exports.loginUser = loginUser