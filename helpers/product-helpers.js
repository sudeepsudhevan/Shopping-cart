var db = require('../config/connection');
var collection = require('../config/collections');
const ObjectId = require('mongodb').ObjectId;


// add product to database

module.exports = {
    addProduct: (product, callback) => {
        
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data.insertedId);
            
            callback(data.insertedId);
        })
        .catch((err)=>{
            console.log(err);
        })
        },
        getAllProducts:()=>{
            return new Promise(async(resolve,reject)=>{
                let products=await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
                resolve(products)
            })
        },
        deleteProduct:(prodId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:new ObjectId(prodId)}).then((response)=>{
                    console.log(response);
                    resolve(response)
                })
            })
        },
        getProductDetails:(prodId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new ObjectId(prodId)}).then((product)=>{
                    resolve(product)
                })
            })
        },
        updateProduct:(prodId,proDetails)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(prodId)},
                {
                    $set:{
                        Name:proDetails.Name,
                        Description:proDetails.Description,
                        Price:proDetails.Price,
                        Category:proDetails.Category
                    }
                }).then((response)=>{
                    resolve()
                })
            })
        },
        getCartCount:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let count=0;
                let cart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:ObjectId(userId)})
                if(cart){
                    count=cart.products.length
                }
                resolve(count)
            })
        },
        getAllOrders:(userId)=>{
            return new Promise(async(resolve,reject)=>{
                let orders=await db.get().collection(collection.ORDER_COLLECTIONS).find().toArray()
                resolve(orders)
            })
        },
        getOrderProducts:(orderId)=>{
            return new Promise(async(resolve,reject)=>{
                let orderItems=await db.get().collection(collection.ORDER_COLLECTIONS).aggregate([
                    {
                        $match:{_id:ObjectId(orderId)}
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
                    }
                ]).toArray()
                console.log(orderItems);
                resolve(orderItems)
            })
        },
        changeStatus:(orderId,orderStatus)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.ORDER_COLLECTIONS).updateOne({_id:ObjectId(orderId)},
                {
                    $set:{
                        status:orderStatus
                    }
                }).then(()=>{
                    resolve()
                })
            })
        },
        getAllUsers:()=>{
            return new Promise(async(resolve,reject)=>{
                let users=await db.get().collection(collection.USER_COLLECTIONS).find().toArray()
                resolve(users)
            })
        },
        getUserDetails:(userId)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.USER_COLLECTIONS).findOne({_id:ObjectId(userId)}).then((user)=>{
                    resolve(user)
                })
            })
        },
        


}
     

