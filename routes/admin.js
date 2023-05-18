var express = require('express');
const { render } = require('../app');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');

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
  let image = req.files.Image;
  let imagePath = '/product-images/' + Date.now() + '.jpg';
  image.mv('./public' + imagePath, (err, done) => {
    if (!err) {
      let product = req.body;
      product.image = imagePath;
      productHelpers.addProduct(product, (id) => {
        res.render("admin/add-product", { admin: true });
      });
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
