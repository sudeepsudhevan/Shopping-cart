var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  let products = [
    {
      name: 'iPhone 13 Pro Max',
      category: 'Smartphone',
      description: "iPhone 13 Pro max with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/09/2-1-500x500.jpg",
    },
    {
      name: "Oneplus 9 RT",
      category: "smartphone",
      description: "Oneplus 9RT with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/08/20211011145119.jpg",
    },
    {
      name: "Oppo Reno 7",
      category: "smartphone",
      description: "Oppo Reno 7 with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2022/03/1-11-500x500.jpg",
    },
    {
      name: "Samsung Galaxy S21 FE",
      category: "smartphone",
      description: "Samsung Galaxy S21 FE with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/06/4-500x500.jpg",
    }
  ]

  res.render('admin/view-products', { admin: true, products });
});
router.get('/add-product', function (req, res ) {
  res.render('admin/add-product',{admin: true});

});
router.post('/add-product', function (req, res ) {
  console.log(req.body); 
  console.log(req.files.Image);
});

module.exports = router;
