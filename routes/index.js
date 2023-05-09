var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  let products = [
    {
      name: 'iPhone 13 Pro Max',
      category: 'Smartphone',
      description: "This is iPhone 13 Pro max 128GB",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/09/2-1-500x500.jpg",
    },
    {
      name: "oneplus 9 RT",
      category: "smartphone",
      description: "this is oneplus 9RT with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/08/20211011145119.jpg",
    },
    {
      name: "oppo Reno 7",
      category: "smartphone",
      description: "this is oppo Reno 7 with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2022/03/1-11-500x500.jpg",
    },
    {
      name: "Samsung Galaxy S21 FE",
      category: "smartphone",
      description: "this is Samsung Galaxy S21 FE with 8gb ram and 128gb storage",
      Image: "https://www.gizmochina.com/wp-content/uploads/2021/06/4-500x500.jpg",
    }
  ]
  res.render('index', { products });
});

module.exports = router;
