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
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        console.log('count:', details.count, 'quantity:', details.quantity)
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTIONS)
                .updateOne({_id:new objectId(details.cart)},
                    {
                        $pull:{products:{item:new objectId(details.product)}} //pull is a function to remove the product from the cart
                    }
                ).then((response)=>{
                    resolve({removeProduct:true})
                    
                    
                })
            }else{
                db.get().collection(collection.CART_COLLECTIONS)
                .updateOne({_id:new objectId(details.cart),'products.item':new objectId(details.product)},
                    {
                        $inc:{'products.$.quantity':details.count} //inc is a function to increment the quantity of the product
                    }
                ).then((response)=>{
                    resolve({status:true})
                })
            }
        })
    },
    removeProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTIONS)
            .updateOne({_id:new objectId(details.cart)},
                {
                    $pull:{products:{item:new objectId(details.product)}} //pull is a function to remove the product from the cart
                }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{ 
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{ //group is a function to group the products
                    _id:null,
                    total:{$sum:{$multiply:[
                       {$convert: {input: '$quantity', to: 'double'}},
                       {$convert: {input: '$product.Price', to: 'double'}}
                    ]}} //multiply is a function to multiply the quantity and price of the product
                    }
                   }
            ]).toArray()
            
            if (total && total.length > 0) {
                resolve(total[0].total);
            } else {
                // handle the case where total is undefined or empty
                resolve(0);
            }
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTIONS).deleteOne({user:new objectId(order.userId)})   
                resolve()
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:new objectId(userId)})
            console.log(cart)
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTIONS).find({userId:new objectId(userId)}).toArray()
            resolve(orders)
        })
    }   
    
    
}