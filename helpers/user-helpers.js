var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;



module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            console.log(collection.USER_COLLECTIONS)
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            }).catch((err)=>{
                console.log(err);
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTIONS).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        }) 

    },
    addToCart: (proId, userId) => {
        let proObj = {
            item:new objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user:new objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId) //findIndex is a function to find the index of the product
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTIONS)
                        .updateOne({ user:new objectId(userId), 'products.item':new objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 } //$.quantity is the quantity of the product
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTIONS)
                        .updateOne({ user:new objectId(userId) },
                            {
                                $push: { products: proObj }
                            }).then((response) => {
                                resolve()
                            })
                }
            } else {
                let cartObj = {
                    user:new objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match: { user:new objectId(userId) }  //match is a function to match the user id
                },
                {
                    $unwind: '$products'   //unwind is a function to unwind the products array
                },
                {
                    $project: {                 
                        item: '$products.item',     
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {                         
                        from: collection.PRODUCT_COLLECTIONS, 
                        localField: 'item',        //localField is the field in the cart collection
                        foreignField: '_id',        //foreignField is the field in the product collection
                        as: 'product'           //as is the name of the array
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            // console.log(cartItems);
            console.log(cartItems[0].product);
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:new objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    }
}