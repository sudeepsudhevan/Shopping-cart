var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function (req, res, next) { // This is the root route
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { admin: false, products });
  });
  
});

router.get('/login', (req, res) => {
  res.render('user/login'); //render is used to render the page, here it is login page
});
router.get('/signup', (req, res) => {
  res.render('user/signup');
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    res.redirect('/login'); //redirect to login page
    
  });
});
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      res.redirect('/');
    }else{
      res.redirect('/login');
    }

  });

}) 

module.exports = router;
