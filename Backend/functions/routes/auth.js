const express = require('express')
var router = express.Router();

const firebaseDBConfig = require('../common/firebasedb');

const firebase = require('firebase');
const admin = require('firebase-admin');

const UserAuth = require('../middleware/auth');
const columnNameMappers = require('../util/columnNameMappers');

router.get('/profile', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.user.userId;
        var user_query = db.collection('users').doc(userId);
        return user_query.get().then(function (doc) {
            if (doc.exists) {
                let user = Object.assign({ userId: userId }, doc.data())
                return response.status(200).json(user);
            } else {
                return response.status(500).json(null);
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    } catch (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.put('/profile', UserAuth, async (request, response) => {

    const db = admin.firestore();
    let userId = request.user.userId;
    const mapperArray = columnNameMappers.getUserProfileMapperList();
    let updateMapperList = {};
    let userRef = db.collection("users");
    return await userRef.doc(userId).get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return db.collection("users").doc(doc.id).update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `User Account updated successfully`,
                updatedObj: updateMapperList
            });
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });

        })
    }).catch((err) => {
        return response.status(500).json({
            message: `Something went wrong`
        });
    })
});


module.exports = router;
