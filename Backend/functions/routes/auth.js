const express = require('express')
var router = express.Router();

const firebaseDBConfig = require('../common/firebasedb');

const firebase = require('firebase');
const admin = require('firebase-admin');

const UserAuth = require('../middleware/auth');
const columnNameMappers = require('../util/columnNameMappers');
const constants = require('../util/constants');
const productUtil = require('../util/product');
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

router.post('/carts', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.user.userId;
    let itemId = request.body.itemId;
    const cartsObj = {
        itemId: itemId,
        itemName: request.body.itemName,
        selectedColor: request.body.selectedColor,
        imgs: request.body.imgs,
        selectedModel: request.body.selectedModel,
        itemCount: request.body.itemCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    let cartId = uuid4();
    var cartsRef = db.collection('carts');
    return Promise.all([
        cartsRef.doc(userId).collection('items').doc(cartId).set(cartsObj)
    ]).then((doc) => {
        return response.status(201).json({
            message: `New Cart Item added successfully`
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});


router.get('/carts', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.user.userId;
        let userCartItems = [];
        await db.collection("carts").doc(userId).collection("items").get()
            .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    let cart = Object.assign({ cartId: doc.id }, doc.data())
                    userCartItems.push(cart);
                });
            });

        return response.status(200).json({
            userCartItems
        })


    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.delete('/carts', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.user.userId;
        const cartsRef = db.collection('carts').doc(userId);
        const userCartItemsQuery = await cartsRef.collection('items');
        await userCartItemsQuery.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                doc.ref.delete();
            });
        })
        return response.status(200).json({
            message: `Deleted successfully`
        });

    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.put('/carts/items/:cartItemId', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.user.userId;
    let cartItemId = request.params.cartItemId;
    const mapperArray = columnNameMappers.getCartItemMapperList();
    let updateMapperList = {};
    const cartsRef = db.collection('carts').doc(userId);
    const userCartItemsQuery = await cartsRef.collection('items').doc(cartItemId);
    return await userCartItemsQuery.get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return userCartItemsQuery.update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `Cart ${doc.id} updated successfully`,
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
router.post('/orders', UserAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.user.uid;
    let orderId = uuid4();
    let orderItems_ = [];
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    let promocode = request.body.promocode;

    if (promocode !== null) {
        let promoCodeQuery = db.collection('promocodes').where("promocode", "=", promocode);
        promoCodeQuery = promoCodeQuery.where('expiryDate', '>', new Date().toISOString())
        promoCodeQuery = promoCodeQuery.where("promocode", "=", promocode);
        await promoCodeQuery.where('usedUsers', 'array-contains', userId).get((doc) => {
            if (doc.exists) {
                return response.status(500).json({
                    message: `Promocode is already used by the user`
                });
            }
        })
    }
    let companyName, phoneNumber = null;

    if(req.body.hasOwnProperty("companyName")){
        companyName = req.body.companyName;
    }
    if(req.body.hasOwnProperty("phoneNumber")){
        phoneNumber = req.body.phoneNumber;
    }
    for (let order of request.body.orderItem) {
        let result_ = await productUtil.checkAvailability(order.itemId, order.modelId, order.qty);
        console.log(result_)
        if (result_.isError) {
            isError = result_;
            break;
        }

        let order_ = {
            price: order.price,
            model: order.model,
            qty: order.qty,
            itemId: order.itemId,
        }
        orderItems_.push(order_);
    }
    if (isError.isError) {
        return response.status(500).json({
            message: isError.error
        });

    }
    const orderObj = {
        orderItems: orderItems_,
        shipping: {
            address: request.body.address,
            city: request.body.city,
            postalCode: request.body.postalCode,
            country: request.body.country,
        },
        user: userId,
        promocode: promocode,
        companyName: companyName,
        orderStatus: constants.ORDER_STATUSES.PROCESSING,
        phoneNumber: phoneNumber,
        itemsPrice: 0,
        taxPrice: 0,
        shippingPrice: 0,
        isDelivered: false,
        deliveredAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    return await db.doc(`/orders/${orderId}`).set(orderObj).then(async () => {
        let orderObj_ = Object.assign({ orderId: orderId }, orderObj)
        await promoCodeQuery.get((doc) => {
            doc.update({
                usedUsers: arrayUnion(userId)
            });
        })
        return response.status(201).json({
            message: `New Order ${orderId} created successfully`,
            data: orderObj_
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});

router.get('/orders/:orderId', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        var orderquery = db.collection('orders').doc(request.params.orderId).where("user", "=", request.user.uid);
        return await orderquery.get().then(async function (doc) {
            if (doc.exists) {
                let order = Object.assign({ orderId: request.params.orderId }, doc.data())
                var item_query = db.collection('items').doc(order.itemId);
                let discount = 0;
                let itemName = "";
                let imgs = [];
                await item_query.get().then(function (doc) {
                    if (doc.exists) {
                        discount = doc.data().discount;
                        itemName = doc.data().itemName;
                        imgs = doc.data().imgs;
                    } else {
                        return response.status(500).json(null);
                    }
                }).catch(function (error) {
                    console.log("Error getting document:", error);
                });
                let orderPrice = parseFloat(order.price) * parseInt(order.qty);
                let discountAmt = orderPrice * discount;
                let discountedPrice = orderPrice - discountAmt;
                totalItemsPrcesWithDiscount = totalItemsPrcesWithDiscount + discountedPrice;
                order.name = itemName;
                order.imgs = imgs;
                order.discount = discount;
                order.totalPrice = totalItemsPrcesWithDiscount;
                return response.status(200).json(order);
            } else {
                return response.status(500).json(null);
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });


    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }
})

router.get('/orders/users/:userId', UserAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.user.userId;
        let orders = [];

        await db.collection("orders").where("user", "=", userId).get()
            .then(querySnapshot => {
                querySnapshot.forEach(async (doc) => {
                    let order = Object.assign({ orderId: doc.id }, doc.data())
                    var item_query = db.collection('items').doc(order.itemId);
                    let discount = 0;
                    let itemName = "";
                    let imgs = [];
                    await item_query.get().then(function (doc) {
                        if (doc.exists) {
                            discount = doc.data().discount;
                            itemName = doc.data().itemName;
                            imgs = doc.data().imgs;
                        } else {
                            return response.status(500).json(null);
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                    let orderPrice = parseFloat(order.price) * parseInt(order.qty);
                    let discountAmt = orderPrice * discount;
                    let discountedPrice = orderPrice - discountAmt;
                    totalItemsPrcesWithDiscount = totalItemsPrcesWithDiscount + discountedPrice;
                    order.name = itemName;
                    order.imgs = imgs;
                    order.discount = discount;
                    order.totalPrice = totalItemsPrcesWithDiscount;
                    orders.push(order);

                });
            });

        return response.status(200).json({
            orders
        })

    } catch (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    }
})


module.exports = router;
