const firebaseDBConfig = require('../common/firebasedb');

const admin = require('firebase-admin');
const firebase = require('firebase');
const constants = require('../util/constants');
const tokenGenerator = require('../util/tokenGenerator');

const AdminAuth = (req, res, next) => {
    const db = admin.firestore();
    let idToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({
            error: `Unauthorized`
        });
    }
    let decodedToken_ = tokenGenerator.verifyToken(idToken);
    if(decodedToken_ == null){
        return res.status(403).json({
            error: `Unauthorized, Invalid Signature`
        });
    }
    if(decodedToken_ == false){
        return res.status(403).json({
            error: `Token has expired, please login`
        });
    }
    req.user = decodedToken_;
    return db.collection('admins').doc(req.user.uid).get().then((data) => {
        if (!data.exists) {
            return res.status(403).json({
                error: `Unauthorized`
            });
        }
        let user = data.data();
        user = Object.assign({ userId: data.id }, data.data())
        if (user !== null) {
            req.user = user;
            return next();

        } else {
            return res.status(403).json({
                error: `Unauthorized`
            });
        }

    });
}

module.exports = AdminAuth;