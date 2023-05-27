var express = require('express');
const { render } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}
/* GET users listing. */
router.get('/', function (req, res, next) {
    productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render('admin/view-products', { admin: true, products });
  });
});


  router.get('/login', (req, res) => {
    if(req.session.admin){
      res.redirect('/');  //redirect to home page
    }else{
      res.render('admin/login',{"loginErr":req.session.adminLoginErr}); //render is used to render the page, here it is login page
      req.session.adminLoginErr = false;
    }



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
  res.render('admin/edit-product', { product,admin: true });
})
router.post('/edit-product/:id', (req, res) => {
  console.log(req.params.id);
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + req.params.id + '.jpg')
      }
    
  })  
})
router.get('/all-orders', (req, res) => {
  productHelpers.getAllOrders().then((orders) => {
    console.log(orders);
    res.render('admin/all-orders', { admin: true, orders })
  })
})

router.get('/view-order-products/:id', async (req, res) => {
  let products = await productHelpers.getOrderProducts(req.params.id)
  console.log(products);
  res.render('admin/view-order-products', { admin: true, products })
})

router.get('/change-status/:id', (req, res) => {
  let status = req.params.status
  let orderId = req.params.id
  productHelpers.changeStatus(orderId, status).then(() => {
    res.redirect('/admin/all-orders')
  })
})

router.get('/all-users', (req, res) => {
  productHelpers.getAllUsers().then((users) => {
    console.log(users);
    res.render('admin/all-users', { admin: true, users })
  })
})

router.get('/delete-user/:id', (req, res) => {
  let userId = req.params.id;
  console.log(userId);
  productHelpers.deleteUser(userId).then((response) => {
    res.redirect('/admin/all-users');
  })
})

router.get('/edit-user/:id', async (req, res) => {
  let user = await productHelpers.getUserDetails(req.params.id)
  console.log(user);
  res.render('admin/edit-user', { user,admin: true });
})

module.exports = router;
