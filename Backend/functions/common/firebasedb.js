var firebase;
var db;
var admin;

const setAdmin = (admin) => {
    admin = admin;
}

const setFirebaseConfig = (firebase) => {
    
    firebase = firebase;
}

const setDB = (db) => {
    
    db = db;
}

const getFirebase = () => {
    return firebase;
}

const getAdmin = () => {
    return admin;
}

const getDBInstance = () => {
    return db;
}


module.exports = {
    setAdmin,
    getDBInstance,
    setFirebaseConfig,
    getFirebase,
    getAdmin,
    setDB
}