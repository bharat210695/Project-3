const jwt = require('jsonwebtoken')
const UserModel = require('../models/userModel')
const BookModel = require('../models/bookModel')

//all the book routes are protected=================================================
const authentication = async function(req, res, next) {
    try {
        let token = req.headers["x-auth-token"]

        if (!token)
            return res.status(401).send({ status: false, msg: "Token not present" })

        let decodedToken = jwt.verify(token, "project-3_group-9")

        if (!decodedToken)
            return res.status(401).send({ status: false, msg: "Token is invalid" })

        next()

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }
}

// check authorization for owner of the book===================================================
const authorization = function(req, res, next) {
    try {
        let token = req.headers["x-auth-token"]

        if (!token)
            return res.status(401).send({ status: false, msg: "Token not present" })

        let decodedToken = jwt.verify(token, "project-3_group-9")

        if (!decodedToken)
            return res.status(401).send({ status: false, msg: "Token is invalid" })

        let userId = req.query.authorId

        if (!userId)
            return res.status(400).send({ status: false, msg: "Please Send Author Id" })

        let userLoggedIn = decodedToken.userId

        if (userId !== userLoggedIn) {

            res.status(403).send({ status: false, msg: "User is not Allowed access the request" })
        }
        next()

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message })
    }

}


module.exports.authorization = authorization
module.exports.authentication = authentication