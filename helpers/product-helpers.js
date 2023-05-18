var db = require('../config/connection');
var collection = require('../config/collections');


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
        }
}
     

