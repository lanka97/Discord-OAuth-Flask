const firebase = require('firebase');

const promoCodeGenerator = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < charactersLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const db = firebase.firestore();
    const increment = firebase.firestore.FieldValue.increment(1);

    result += increment;
    return result;
};

module.exports = {
    promoCodeGenerator
}