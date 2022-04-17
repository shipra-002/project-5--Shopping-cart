const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const productController=require("../controllers/productController")
const middleware=  require("../middleware/auth") 
const cartController=require("../controllers/cartController")


//user
router.post("/register" , UserController.createUser)
router.post("/login",UserController.loginUser)
router.get( "/user/:userId/profile",middleware.authentication,UserController.getUser)
router.put("/user/:userId/profile",middleware.authentication,middleware.authorisation,UserController.updateUser)
//product

router.post("/products",productController.createProduct)
router.get("/products/:productId",productController.getproductbyId)
router.get("/products",productController.getSpecificProduct)
router.delete("/products/:productId",productController.deleteProduct)
router.put("/products/:productId",productController.updateProduct)

//cart
router.post("/users/:userId/cart",cartController.createCart)

module.exports = router;