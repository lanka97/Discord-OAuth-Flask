const express = require('express')
var router = express.Router();
const admin = require('firebase-admin');
const firebase = require('firebase');
const validations = require('../common/validations');
const uuid4 = require('uuid4');
const UserAuth = require('../middleware/auth');
const tokenGenerator = require('../util/tokenGenerator');

router.post('/signup/email', (req, res) => {
    const db = admin.firestore();
    const newUser = {
        email: req.body.email,
        password: req.body.password,

        fname: req.body.firstname,
        lname: req.body.lastname,
        phonenum: req.body.phonenum
    }
    let errors = {}

    if (validations.isEmpty(newUser.email)) {
        errors.email = 'Email must not be empty';
    } else if (!validations.isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address';
    }

    if (validations.isEmpty(newUser.password)) {
        errors.password = 'Password must not be empty';
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }
    let userId;

    return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).then(async function (userData) {
        let user = await firebase.auth().currentUser;
        // console.log(user);
        if (user !== null) {
            userId = user.uid;
            newUser.createdAt = new Date().toISOString()
            newUser.updatedAt = new Date().toISOString()
            console.log(userId);
            return await firebase.auth().currentUser.getIdToken().then(async (token) => {
                return await db.collection("users").doc(userId).set(newUser).then(() => {
                    let customToken = tokenGenerator.issueToken(userId, newUser.email);
                    return res.status(201).json({
                        customToken
                    })
                })
            }).catch((err) => {
                console.log(err);
                return res.status(500).json({
                    message: `Something went wrong`
                });
            })
        }
        else {
            console.log("err");
            return res.status(500).json({
                message: `Something went wrong`
            });
        }


    }, function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            return res.status(400).json({
                status: 400,
                code: 'WEAKCREDENTIALS',
                description: "Password is too weak",
                message: "Password is too weak"
            })

        } else if (errorCode == 'auth/email-already-in-use') {
            return res.status(400).json({
                status: 400,
                code: 'ALREADYINUSE',
                description: "Email is already in use",
                message: "Email is already in use"
            })

        }
        else {
            return res.status(400).json({
                message: errorMessage
            })
        }
    });

})

router.post('/login/email', async (req, res) => {
    const db = admin.firestore();
    try {
        const user = {
            email: req.body.email,
            password: req.body.password
        }

        let errors = {}

        if (validations.isEmpty(user.email)) {
            errors.email = 'Email must not be empty';
        } else if (!validations.isEmail(user.email)) {
            errors.email = 'Must be a valid email address';
        }

        if (validations.isEmpty(user.password)) {
            errors.password = 'Password must not be empty';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json(errors);
        }
        return await firebase.auth().signInWithEmailAndPassword(user.email, user.password).then((data) => {
            return data;
        }).then(token => {
            let customToken = tokenGenerator.issueToken(token.user.uid, token.user.email);
            return res.status(200).json({
                token: customToken
            })
        }).catch((err) => {
            console.log(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({
                    genereal: "Wrong credentials, please try again"
                })
            } else {
                return res.status(500).json({
                    message: `Something went wrong`
                })
            }
        })
    } catch (err) {
        return res.status(500).json({
            message: `Something went wrong`
        });
    }

})

module.exports = router;
