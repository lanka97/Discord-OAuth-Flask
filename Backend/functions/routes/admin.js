const express = require('express')
var router = express.Router();

const firebaseDBConfig = require('../common/firebasedb');

const firebase = require('firebase');
const admin = require('firebase-admin');

const AdminAuth = require('../middleware/admin');

const columnNameMappers = require('../util/columnNameMappers');

const uuid4 = require('uuid4');

const mailSentService = require('../services/email');
const validations = require('../common/validations');
const { promoCodeGenerator } = require('../util/promocodegenerator');
const promocodegenerator = require('../util/promocodegenerator');
const tokenGenerator = require('../util/tokenGenerator');
const product = require('../util/product');

router.post('/signup', AdminAuth, (req, res) => {
    const db = admin.firestore();
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        fname: req.body.firstname,
        lname: req.body.lastname
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
    let userId, idToken;
    return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).then(async function (userData) {
        let user = await firebase.auth().currentUser;
        if (user !== null) {
            userId = user.uid;
            newUser.createdAt = new Date().toISOString()
            newUser.updatedAt = new Date().toISOString()
            return await firebase.auth().currentUser.getIdToken().then(async (token) => {
                return await db.collection("admins").doc(userId).set(newUser).then(() => {
                    let customToken = tokenGenerator.issueToken(userId, newUser.email);
                    return res.status(201).json({
                        customToken
                    })
                })
            }).catch((err) => {
                return res.status(500).json({
                    message: `Something went wrong`
                });
            })
        }
        else {
            return res.status(500).json({
                message: `Something went wrong`
            });
        }


    }, function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            return res.status(400).json({
                message: 'Password is too weak'
            })
        } else if (errorCode == 'auth/email-already-in-use') {
            return res.status(400).json({
                message: 'Email is already in use'
            })
        }
        else {
            return res.status(400).json({
                message: errorMessage
            })
        }
    });
})

router.post('/login', (req, res) => {
    const db = admin.firestore();
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

    return firebase.auth().signInWithEmailAndPassword(user.email, user.password).then((data) => {
        return data;
    }).then(token => {
        let customToken = tokenGenerator.issueToken(token.user.uid, token.user.email);
        res.json({
            token: customToken
        });
    }).catch((err) => {
        console.error(err);
        if (err.code === 'auth/wrong-password') {
            return res.status(403).json({
                genereal: "Wrong credentials, please try again"
            })
        } else {
            return res.status(500).json({
                error: err.code
            })
        }
    })
})

router.get('/users', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('users').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let users = [];
            data.forEach((doc => {
                let user = Object.assign({ userId: doc.id }, doc.data())
                users.push(user);
            }));
            return response.status(200).json(users);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })

})


router.get('/users/:userId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let user = null;
        return await db
            .collection("users")
            .doc(request.params.userId)
            .get()
            .then(async (docRef) => {
                user = docRef.data();
                let userObj = Object.assign({ userId: docRef.id }, user)
                return response.status(200).json(userObj);
            }).catch((error) => {
                return response.status(500).json(null);
            })
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.get('/admins', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('admins').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let admins = [];
            data.forEach((doc => {
                let admin = Object.assign({ adminId: doc.id }, doc.data())
                admins.push(admin);
            }));
            return response.status(200).json(admins);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })

})

router.put('/admins/:adminId', AdminAuth, async (request, response) => {

    const db = admin.firestore();
    const mapperArray = columnNameMappers.getProfileMapperList();
    let updateMapperList = {};
    let adminId = request.params.adminId;
    return db.collection('admins').doc(adminId).get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return db.collection('admins').doc(doc.id).update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `Admin Account ${doc.id} updated successfully`,
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
router.get('/profile', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let adminId = request.user.userId;
        var user_query = db.collection('admins').doc(adminId);
        return user_query.get().then(function (doc) {
            if (doc.exists) {
                let user = Object.assign({ adminId: adminId }, doc.data())
                return response.status(200).json(user);
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

router.put('/profile', AdminAuth, async (request, response) => {

    const db = admin.firestore();
    const mapperArray = columnNameMappers.getProfileMapperList();
    let updateMapperList = {};
    let adminId = request.user.userId;
    return db.collection('admins').doc(adminId).get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return db.collection('admins').doc(doc.id).update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `Admin Account ${doc.id} updated successfully`,
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

router.post('/items/:itemId/models', AdminAuth, async (request, response) => {

    const db = admin.firestore();

    const modelObj = {
        brand: request.body.brand,
        model: request.body.model,
        price: request.body.price,
        qty: request.body.qty,
    }
    let model_id = uuid4();

    return db.collection('items').doc(request.params.itemId).collection('models').doc(model_id).set(modelObj).then(async (doc) => {
        let model = Object.assign({ modelId: model_id }, modelObj)
        return response.status(200).json({
            data: model,
            message: `Item ${request.params.itemId}, model added successfully`
        });
    }).catch((err) => {
        console.log(err)
        return response.status(500).json({
            message: `Something went wrong`
        });
    })
});

router.delete('/items/:itemId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.collection("items").doc(request.params.itemId).delete().then(function () {
        return response.status(200).json({
            message: `Deleted successfully`
        });
    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    });
})

router.delete('/admins/:adminId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await admin.auth().deleteUser(request.params.adminId).then(async () => {
        return await db.collection("admins").doc(request.params.adminId).delete().then(function () {
            return response.status(200).json({
                message: `Deleted successfully`
            });
        }).catch(function (error) {
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    })
})

router.post('/items', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let isNewArrival = true
    let isBasicCase = false;
    let isNewDesign = false
    let isJustforYou = false;
    let isBestSeller = false;

    if (request.body.hasOwnProperty(isNewArrival)) {
        isNewArrival = request.body.isNewArrival;
    }
    if (request.body.hasOwnProperty(isBasicCase)) {
        isBasicCase = request.body.isBasicCase;
    }
    if (request.body.hasOwnProperty(isNewDesign)) {
        isNewDesign = request.body.isNewDesign;
    }
    if (request.body.hasOwnProperty(isJustforYou)) {
        isJustforYou = request.body.isJustforYou;
    }
    if (request.body.hasOwnProperty(isBestSeller)) {
        isBestSeller = request.body.isBestSeller;
    }
    const itemsObj = {
        discount: request.body.discount,
        itemName: request.body.itemName,
        colors: request.body.colors,
        imgs: request.body.imgs,
        // models: request.body.models,
        specs: request.body.specs,
        isNewArrival: isNewArrival,
        isBasicCase: isBasicCase,
        isNewDesign: isNewDesign,
        isJustforYou: isJustforYou,
        isBestSeller: isBestSeller,
        desc: request.body.desc,
        priceStartAt: request.body.priceStartAt,
        priceEndAt: request.body.priceEndAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    let item_id = uuid4();

    return await db.doc(`/items/${item_id}`).set(itemsObj).then((doc) => {
        let itemObj_ = Object.assign({ itemId: item_id }, itemsObj)
        return response.status(201).json({
            message: `New Item ${item_id} created successfully`,
            data: itemObj_
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});

router.delete('/items/:itemId/models/:modelId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.collection('items').doc(request.params.itemId).collection('models').doc(request.params.modelId).delete().then(function () {
        return response.status(200).json({
            message: `Deleted successfully`
        });
    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    });
})

router.put('/items/:itemId', AdminAuth, async (request, response) => {

    const db = admin.firestore();
    const mapperArray = columnNameMappers.getItemMapperList();
    let updateMapperList = {};
    await mapperArray.forEach((value, key, map) => {
        if (request.body.hasOwnProperty(value)) {
            if (request.body[value] !== null) {
                updateMapperList[key] = request.body[value];
            }
        }
    })
    return db.collection('items').doc(request.params.itemId).update(updateMapperList).then((doc) => {
        return response.status(200).json({
            message: `Product ${doc.id} updated successfully`,
            updatedObj: updateMapperList
        });
    }).catch((err) => {
        return response.status(304).json({
            message: `Product could not modified`
        });

    })
});
router.put('/items/:itemId/models/:modelId', AdminAuth, async (request, response) => {

    const db = admin.firestore();
    const mapperArray = columnNameMappers.getModelMapperList();
    let updateMapperList = {};
    await mapperArray.forEach((value, key, map) => {
        if (request.body.hasOwnProperty(value)) {
            if (request.body[value] !== null) {
                updateMapperList[key] = request.body[value];
            }
        }
    })
    return db.collection('items').doc(request.params.itemId).collection('models').doc(request.params.modelId).update(updateMapperList).then((doc) => {
        return response.status(200).json({
            message: `Model ${doc.id} updated successfully`,
            updatedObj: updateMapperList
        });
    }).catch((err) => {
        return response.status(404).json({
            message: `Model not found`
        });

    })
});

router.get('/items/:itemId', AdminAuth, async (request, response) => {
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
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.get('/items', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('items').
        orderBy('createdAt', 'desc').
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

router.post('/newsletters', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    const textBody = request.body.textBody;
    const htmlBody = request.body.htmlBody;
    const mailSubject = request.body.mailSubject;
    return await db.
        collection('subscriptions').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let subscriptions = [];
            data.forEach((async (doc) => {
                try {
                    await mailSentService.sentNewsLetterEmail(doc.id, textBody, htmlBody, mailSubject)
                } catch (error) {
                    console.error(error);
                }
            }));
            return response.status(200).json(subscriptions);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

router.post('/subscribes', AdminAuth, async (request, response) => {
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
router.get('/subscribes', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('subscriptions').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let subscriptions = [];
            data.forEach((doc => {
                let subscribe = Object.assign({ email: doc.id }, doc.data())
                subscriptions.push(subscribe);
            }));
            return response.status(200).json(subscriptions);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

router.delete('/subscribes/:subscription_email', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return db.collection('subscriptions').doc(request.params.subscription_email).delete().then(function () {
        response.status(200).json({
            message: `Deleted successfully`
        });

    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    });
})

router.get('/homepageimgs', AdminAuth, async (request, response) => {
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

router.get('/homepageimgs/:homepageimgsId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        var homepageimgs_query = db.collection('home_page_imgs').doc(request.params.homepageimgsId);
        return homepageimgs_query.get().then(function (doc) {
            if (doc.exists) {
                let homepageimg = Object.assign({ homepageimgsId: request.params.homepageimgsId }, doc.data())
                return response.status(200).json(homepageimg);
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

router.delete('/homepageimgs/:homePageImgsId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.collection("home_page_imgs").doc(request.params.homePageImgsId).delete().then(function () {
        return response.status(200).json({
            message: `Deleted successfully`
        });
    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    });
})

router.post('/homepageimgs', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let imgUrlList = request.body.imgUrlList;

    if (imgUrlList == null || imgUrlList.length == 0) {
        return response.status(500).json({
            message: `Require images`
        });
    }

    return await imgUrlList.forEach(imgObj => {
        const homepageimgsObj = {
            imgUrl: imgObj,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        let home_page_imgs_id = uuid4();
        db.doc(`/home_page_imgs/${home_page_imgs_id}`).set(homepageimgsObj).then((doc) => {
            let homepageimgsObj_ = Object.assign({ imgId: home_page_imgs_id }, homepageimgsObj)
            return response.status(201).json({
                message: `New Image ${home_page_imgs_id} added successfully`,
                data: homepageimgsObj_
            });
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });

        })

    });
});

router.put('/homepageimgs/:homePageImgsId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let homePageImgsId = request.params.homePageImgsId;
    const mapperArray = columnNameMappers.getHomePageMapperList();
    let updateMapperList = {};
    const homePageImgsRef = db.collection('home_page_imgs').doc(homePageImgsId);
    return await homePageImgsRef.get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return homePageImgsRef.update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `Home Page Image ${doc.id} updated successfully`,
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

router.get('/carts', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('carts').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let carts = [];
            data.forEach((doc => {
                let cart = Object.assign({ userId: doc.id }, doc.data())
                carts.push(cart);
            }));
            return response.status(200).json(carts);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

router.post('/carts', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.body.userId;
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

router.get('/carts/:userId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.params.userId;
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

router.delete('/carts/:userId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.params.userId;
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

router.put('/carts/:userId/items/:cartItemId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.params.userId;
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

router.get('/orders', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('orders').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let orders = [];
            data.forEach((doc => {
                let order = Object.assign({ orderId: doc.id }, doc.data())
                orders.push(order);
            }));
            return response.status(200).json(orders);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

router.post('/orders', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.body.userId;
    let orderId = uuid4();
    let orderItems_ = [];
    const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
    let promocode = request.body.promocode;
    if (promocode !== null) {
        var promoCodeQuery = db.collection('promocodes').where("promocode", "=", promocode);
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
    if (request.body.hasOwnProperty("companyName")) {
        companyName = request.body.companyName;
    }
    if (request.body.hasOwnProperty("phoneNumber")) {
        phoneNumber = request.body.phoneNumber;
    }
    let isError = {
        isError: false
    }
    for (let order of request.body.orderItem) {
        let result_ = await product.checkAvailability(order.itemId, order.modelId, order.qty);
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

router.get('/orders/:orderId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let orderId = request.params.orderId;
    let order = null;
    let userObj = null;
    try {
        return await db
            .collection("orders")
            .doc(request.params.orderId)
            .get()
            .then(async (docRef) => {
                order = docRef.data();
                let orderItems = []
                await db
                    .collection("users")
                    .doc(order.user)
                    .get()
                    .then(async (docRef) => {
                        let user = docRef.data();
                        userObj = Object.assign({ userId: docRef.id }, user)

                    }).catch((error) => {
                        console.log(error)
                    })
                let orderObj_ = Object.assign({ orderId: request.params.orderId }, order, { userObj })
                return response.status(200).json(orderObj_);
            }).catch((error) => {
                console.log(error)
                return response.status(500).json(null);
            })
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    }

})

router.get('/orders/users/:userId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        let userId = request.params.userId;
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

router.put('/orders/:orderid', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    const mapperArray = columnNameMappers.getOrderMapperList();
    let updateMapperList = {};
    await mapperArray.forEach((value, key, map) => {
        if (request.body.hasOwnProperty(value)) {
            if (request.body[value] !== null) {
                updateMapperList[key] = request.body[value];
            }
        }
    })
    return db.collection('orders').doc(request.params.orderid).update(updateMapperList).then((doc) => {
        return response.status(200).json({
            message: `Order ${doc.id} updated successfully`,
            updatedObj: updateMapperList
        });
    }).catch((err) => {
        return response.status(404).json({
            message: `Model not found`
        });

    })
});

router.delete('/orders/:orderId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let orderId = request.params.orderId;
    return await db.collection("orders").doc(orderId).delete().then(function () {
        return response.status(200).json({
            message: `Deleted Successfully`
        });
    }).catch(function (error) {
        console.log(error)
        return response.status(500).json({
            message: `Something went wrong`
        });
    });

})

router.post('/payment', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let userId = request.body.userId;
    let orderid = request.body.orderid;
    let paymentId = uuid4();
    let paymentAmt = 0;
    const ordersRef = db.collection('userorders').doc(userId);
    const ordersQuery = await ordersRef.collection('orders').doc(orderId).get();
    await ordersQuery.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            paymentAmt = doc.data().totalPrice;
        });
    })
    let isPaid = false;
    if (request.body.paymentAmt == paymentAmt) {
        isPaid = true;
    }
    else {
        return response.status(500).json({
            message: `Insufficient payment`
        });

    }
    const paymentObj = {
        paymentMethod: request.body.paymentMethod,
        orderID: orderid,
        payerID: userId,
        paidAt: request.body.paidAt || new Date().toISOString(),
        isDelivered: false,
        isPaid: isPaid,
        paymentAmt: paymentAmt,
        deliveredAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    return await db.doc(`/payments/${paymentId}`).set(paymentObj).then((doc) => {
        return response.status(201).json({
            message: `New Payment ${doc.id} created successfully`
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});

router.get('/promocodes', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    return await db.
        collection('promocodes').
        where('expiryDate', '>', new Date().toISOString()).
        get().
        then((data) => {
            let promocodes = [];
            data.forEach((doc => {
                let promocode = Object.assign({ promocodeId: doc.id }, doc.data())
                promocodes.push(promocode);
            }));
            return response.status(200).json(promocodes);
        }).catch((err) => {
            console.error(err);
            return response.status(500).json({
                message: `Something went wrong`
            });
        })
})

router.post('/promocodes', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let promocodeId = uuid4();

    const promocodeObj = {
        expiryDate: request.body.expiryDate,
        promocode: promocodegenerator.promoCodeGenerator(),
        discountPercentage: request.body.discountPercentage,
        usedUsers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
    return await db.doc(`/promocodes/${promocodeId}`).set(promocodeObj).then(() => {
        let promocodeObj_ = Object.assign({ promocodeId: promocodeId }, promocodeObj)
        return response.status(201).json({
            message: `New Promo Code ${promocodeId} created successfully`,
            data: promocodeObj_
        });
    }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            message: `Something went wrong`
        });

    })
});

router.get('/promocodes/:promocodeId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    try {
        var promocodequery = db.collection('promocodes').doc(request.params.promocodeId).where('expiryDate', '>', new Date().toISOString());
        return promocodequery.get().then(function (doc) {
            if (doc.exists) {
                let promocode = Object.assign({ promocodeId: request.params.promocodeId }, doc.data())
                return response.status(200).json(promocode);
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

router.put('/promocodes/:promocodeId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    const mapperArray = columnNameMappers.getPromoCodeMapperList();
    let updateMapperList = {};
    let promocodeId = request.params.promocodeId;
    const promocodesRef = db.collection('promocodes').doc(promocodeId);
    return await promocodesRef.get().then(async (doc) => {
        await mapperArray.forEach((value, key, map) => {
            if (request.body.hasOwnProperty(value)) {
                if (request.body[value] !== null) {
                    updateMapperList[key] = request.body[value];
                }
            }
        })
        updateMapperList['updated_at'] = new Date();
        return promocodesRef.update(updateMapperList).then((doc) => {
            return response.status(200).json({
                message: `Promo code ${doc.id} updated successfully`,
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
router.delete('/promocodes/:promocodeId', AdminAuth, async (request, response) => {
    const db = admin.firestore();
    let promocodeId = request.params.promocodeId;
    return await db.collection("promocodes").doc(promocodeId).delete().then(function () {
        return response.status(200).json({
            message: `Deleted Successfully`
        });
    }).catch(function (error) {
        return response.status(500).json({
            message: `Something went wrong`
        });
    });

})


module.exports = router;
