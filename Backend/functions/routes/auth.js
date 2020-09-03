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

});

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

router.post('/records', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.user.userId;
    const recordObj = {
        uid: userId,
        title: request.body.title,
        description: request.body.description,
        date: request.body.date,
        createdAt: new Date().toISOString()
    };
    var recordsRef = db.collection('records');
    return Promise.all([
        recordsRef.doc().set(recordObj)
    ]).then((doc) => {
        return response.status(201).json({
            message: `New Record Item added successfully`
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});


router.get('/records', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.user.userId;
        let userrecordItems = [];
        await db.collection("records").where("uid", '==', userId).get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    let record = Object.assign({ id: doc.id }, doc.data())
                    console.log(doc.id);
                    userrecordItems.push(record);
                });
            });

        return response.status(200).json({
            userrecordItems
        })


    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

});

router.delete('/records/:recordId', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let recordId = request.params.recordId;
    console.log(recordId)
    try {
        let userId = request.user.userId;
        const recordsRef = db.collection('records');
        const record = await recordsRef.doc(recordId).delete();
        
        return response.status(200).json({
            message: `Deleted successfully`
        });

    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

});

router.put('/records/:recordId', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let recordId = request.params.recordId;
    const recordObj = {
        title: request.body.title,
        description: request.body.description,
        date: request.body.date,
        updatedAt: new Date().toISOString()
    };
    console.log(recordId)
    try {
        const recordsRef = db.collection('records');
        const record = await recordsRef.doc(recordId).update(recordObj);
        
        return response.status(200).json({
            message: `Updated successfully`
        });

    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

});

module.exports = router;
