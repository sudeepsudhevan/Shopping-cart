var express = require('express');
const { render } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

/* GET users listing. */
router.get('/', function (req, res, next) {
    productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/view-products', { admin: true, products });
  });


});
router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true });

});
router.post('/add-product', function (req, res) {


  productHelpers.addProduct(req.body, (id) => {
    // Log the value of the id argument
    console.log('id:', id);
    let image = req.files.Image;
    
    
    image.mv('./public/product-images/'+id+'.jpg' ,(err, done) => {
      if (!err) {
        
        res.render("admin/add-product", { admin: true })
      } else {
        console.log(err);
      }
    })

  })

});
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/');
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product, admin: true })
})

module.exports = router;
