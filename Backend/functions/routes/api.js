const express = require('express')
var router = express.Router();
const admin = require('firebase-admin');
const constants = require('../util/constants');
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
        phonenum: req.body.phonenum,
        role: constants.CUSTOMER_ROLE
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
    // let city, address, companyName, postalCode, phoneNumber = " ";
    // if (req.body.hasOwnProperty("city")) {
    //     console.log("hi");
    //     city = req.body.city;
    // }
    // if (req.body.hasOwnProperty("address")) {
    //     address = req.body.address;
    // }
    // if (req.body.hasOwnProperty("companyName")) {
    //     companyName = req.body.companyName;
    // }
    // if (req.body.hasOwnProperty("postalCode")) {
    //     postalCode = req.body.postalCode;
    // }
    // if (req.body.hasOwnProperty("phoneNumber")) {
    //     phoneNumber = req.body.phoneNumber;
    // }
    // newUser.city = city;
    // newUser.address = address;
    // newUser.companyName = companyName;
    // newUser.postalCode = postalCode;
    // newUser.phoneNumber = phoneNumber;

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
router.get('/items/:itemId', async (request, response) => {
    const db = admin.firestore();
    try {
        let item = null;
        return await firebase
            .firestore()
            .collection("items")
            .doc(request.params.itemId)
            .get()
            .then(async (docRef) => {
                item = docRef.data();
                let models = []
                await db.collection('items').doc(request.params.itemId).collection('models').get()
                    .then(docs => {
                        docs.forEach(document => {
                            let model = Object.assign({ modelId: document.id }, document.data())
                            models.push(model)
                        });
                    })
                    .catch(error => {
                        console.log(error)
                    });
                let itemObj_ = Object.assign({ itemId: request.params.itemId }, item, { models })
                return response.status(200).json(itemObj_);
            }).catch((error) => {
                return response.status(500).json(null);
            })
    } catch (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.get('/items', async (request, response) => {

    const db = admin.firestore();
    let isNewArrival = true
    let isBasicCase = false;
    let isNewDesign = false
    let isJustforYou = false;
    let isBestSeller = false;

    let itemRef = db.collection('items');

    if (request.query.hasOwnProperty(isNewArrival)) {
        isNewArrival = request.query.isNewArrival;
        itemRef = itemRef.where("isNewArrival", "==", isNewArrival);
    }
    if (request.query.hasOwnProperty(isBasicCase)) {
        isBasicCase = request.query.isBasicCase;
        itemRef = itemRef.where("isBasicCase", "==", isBasicCase);
    }
    if (request.query.hasOwnProperty(isNewDesign)) {
        isNewDesign = request.query.isNewDesign;
        itemRef = itemRef.where("isNewDesign", "==", isNewDesign);
    }
    if (request.query.hasOwnProperty(isJustforYou)) {
        isJustforYou = request.query.isJustforYou;
        itemRef = itemRef.where("isJustforYou", "==", isJustforYou);
    }
    if (request.query.hasOwnProperty(isBestSeller)) {
        isBestSeller = request.query.isBestSeller;
        itemRef = itemRef.where("isBestSeller", "==", isBestSeller);
    }
    return itemRef.
        get().
        then((data) => {
            let items = [];
            data.forEach((doc => {
                let item = Object.assign({ itemId: doc.id }, doc.data())
                items.push(item);
            }));
            return response.status(200).json(items);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })

})


router.post('/subscribes', async (request, response) => {
    const db = admin.firestore();
    const email = request.body.email;
    let subscribeObj = {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    return await db.doc(`/subscriptions/${email}`).set(subscribeObj).then((doc) => {
        return response.status(201).json({
            message: `Subscribe ${email} added successfully`
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
})

router.get('/homepageimgs', async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('home_page_imgs').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let homepageimgs = [];
            data.forEach((doc => {
                let img = Object.assign({ imgId: doc.id }, doc.data())
                homepageimgs.push(img);
            }));
            return response.status(200).json(homepageimgs);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

module.exports = router;
