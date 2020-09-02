const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express')
const app = express();
var serviceAccount = require("./serviceKeyConfig.json");

const fbConfig = require('./common/firebaseConfig')
const path = require('path')

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')

const api_routes = require('./routes/api')
const admin_routes = require('./routes/admin')
const authUser_routes = require('./routes/auth')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ssd2-cf69f.firebaseio.com"
});

const db = admin.firestore();
const firebaseConfig = {
    apiKey: "AIzaSyCmGcaAoozk7QY4jWWNqx12RPbAC0AC3Zg",
    authDomain: "ssd2-cf69f.firebaseapp.com",
    databaseURL: "https://ssd2-cf69f.firebaseio.com",
    projectId: "ssd2-cf69f",
    storageBucket: "ssd2-cf69f.appspot.com",
    messagingSenderId: "87283880564",
    appId: "1:87283880564:web:8ec810848108ebe1c7b721",
    measurementId: "G-Q0P6TWWWS8"
};
firebase.initializeApp(firebaseConfig);



app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.get('/', function (req, res) {
    console.log("Welcome")
    res.send('Welcome to Phone E Commerce Site')
})
app.use((req, res, next) => {
    req.firebase = firebase;
    next();
})
app.use('/api', api_routes)
app.use('/admin', admin_routes)
app.use('/auth', authUser_routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    var err_ = new Error('Not Found');
    err_.status = err.status || 404;
    err_.message = err.message;

    if (err.status === 404)
        err_.message = "URL Not found";
    // render the error page
    res.status(err_)
    next(err_.message);
    // res.render('error')
})
exports.dev = functions.https.onRequest(app);
