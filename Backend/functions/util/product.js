const firebase = require('firebase');
const admin = require('firebase-admin');

const checkAvailability = async (productId, modelId, qty) => {
    const db = admin.firestore();
    return await db.collection('items').doc(productId).collection('models').doc(modelId).get()
        .then(async (document) => {
            let model = document.data();
            let qty_ = model.qty - qty;
            if (qty_ < 0) {
                return {
                    error: "Insufficient Stock",
                    isError: true
                }
            } else {
                return await db.collection('items').doc(productId).collection('models').doc(modelId).update({ qty: qty_ }).then((doc) => {
                    return {
                        error: "Success",
                        isError: false
                    }
                }).catch((err) => {
                    console.log(err)
                    return {
                        error: "Model not found",
                        isError: true
                    }

                })
            }


        })
        .catch(error => {
            return {
                error: "Error occurred",
                isError: true
            }
        });
}

module.exports = {
    checkAvailability
}