var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


const verifyLogin = (req, res, next) => {
  if(req.session.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) { // This is the root route
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if(req.session.user){
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user,cartCount }); //render is used to render the page, here it is view-products page
  });
  
});

router.get('/login', (req, res) => {
  if(req.session.loggedIn){
    res.redirect('/');  //redirect to home page
  }else
    res.render('user/login',{"loginErr":req.session.loginErr}); //render is used to render the page, here it is login page
    req.session.loginErr = false;
});
router.get('/signup', (req, res) => {
  res.render('user/signup');
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;

    res.redirect('/login'); //redirect to login page
    
  });
});
router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;

      res.redirect('/');
    }else{
      req.session.loginErr = "Invalid username or password";
      res.redirect('/login');
    }

  });

})
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/cart',verifyLogin, async(req, res) => {
  let products =await userHelpers.getCartProducts(req.session.user._id);
  console.log(products);
  res.render('user/cart',{products,user:req.session.user});
});

router.get('/add-to-cart/:id',verifyLogin, (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({status:true})
    
  })
});

router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  })
});

router.post('/remove-product', (req, res, next) => {
  console.log(req.body);
  userHelpers.removeProduct(req.body).then((response) => {
    res.json(response);
  })
});





module.exports = router;
