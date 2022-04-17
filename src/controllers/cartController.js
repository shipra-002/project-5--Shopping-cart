const UserModel = require("../models/userModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")


const isValid = function (value) {
    if (typeof value == 'undefined' || value == 'null' || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidInteger = function isInteger(value) {
    return value % 1 == 0;
}
const isValidString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}





        
//     }

// }

// const createCart = async (req, res) => {
//     try {
//       const userIdFromParams = req.params.userId;
  
//       if (!isValid(userIdFromParams)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter the userId" });
//       }
//       if (!isValidObjectId(userIdFromParams)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter a valid userId" });
//       }
  
//       const user = await UserModel.findOne({ _id: userIdFromParams });
  
//       if (!user) {
//         return res.status(404).send({ status: "FAILURE", msg: "user not found" });
//       }
  
//       const cartAlreadyPresent = await cartModel.findOne({
//         userId: userIdFromParams,
//       });
  
//       const requestBody = req.body;
  
//       if (!isValidRequestBody(requestBody)) {
//         return res.status(400).send({ status: "FAILURE", msg: "enter a body" });
//       }
       
//       const { userId ,items } = requestBody;
  
//       if (!isValid(userId)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter the userId" });
//       }
  
//       if (!isValidObjectId(userId)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter a valid userId" });
//       }
  
//       if (userIdFromParams !== userId) {
//         return res.status(400).send({
//           status: "FAILURE",
//           msg: "user in params doesn't match with user in body",
//         });
//       }
  
//       if (!isValid(items.productId)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter the productId" });
//       }
  
//       if (!isValidObjectId(items.productId)) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter a valid productId" });
//       }
  
//       if (!isValid(items.quantity) && items.quantity < 1) {
//         return res
//           .status(400)
//           .send({ status: "FAILURE", msg: "enter a quantity more than 1 " });
//       }
  
//       const product = await productModel.findOne({ _id: items.productId });
  
//       if (!product) {
//         return res
//           .status(404)
//           .send({ status: "FAILURE", msg: "product not found" });
//       }
        
//       let totalItems = (items).length;
//       let totalPrice = (product).price * (totalItems);
  
//       if (cartAlreadyPresent) {
//           const cartItems = cartAlreadyPresent.items;
//           cartItems.forEach((item) => (totalItems += item.quantity));
//         totalItems += 1;
//         totalPrice += cartAlreadyPresent.totalPrice;
  
//         // if product is already added then only quantity will increase
//         const cart = await cartModel.findOneAndUpdate(
//           { userId: userIdFromParams },
//           {
//             $push: { items: items },
//             $set: { totalPrice: totalPrice, totalItems: totalItems },
//           },
//           { new: true }
//         );
//         return res.status(201).send({ status: "SUCCESS", data: cart });
//       }
  
//       newCart = {
//         userId,
//         items,
//         totalPrice,
//         totalItems,
//       };
  
//       createCart = await cartModel.create(newCart);
  
//       res.status(201).send({ status: "SUCCESS", data: createCart });
//     } catch (error) {
//       res.status(500).send({ status: "FAILURE", msg: error.message });
//     }
// };


// const createCart =async function(req,res){
   
//     let user = req.params.userId
//     let data = req.body

//   //  let items = JSON.parse(data.items)

// if(!isValidObjectId(user)){return res.status(400).send({status:false, msg:"please input user"})}


// let {userId,items,} = data


// // data.items = items

// let checkProduct =await productModel.findOne({_id:items.productId,isDeleted:false})

// if(!isValidObjectId(checkProduct)){return res.status(400).send({status:false, msg:"product is not available"})}

// if(!checkProduct){return res.status(404).send({status:false, msg:"product not found"})}

// if(!isValid(items.quantity)){return res.status(400).send({status:false, msg:"please enter quantity"})}

//   quantity = items.quantity

// let increasedQuantity = await cartModel.findOneAndUpdate({ userId:user, isDeleted: false }, { $inc: { quantity: 1} }, { new: true })
// let totalItems = (items).length;
//  //let totalPrice = (items).price * (totalItems);
// //if(!isValid(totalPrice)){return res.status(400).send({status:false, msg:"totalprice required"})}
// // let Price = (totalPrice).price * (totalItems);
// let finalPrice = await cartModel.findOne({_id:userId,isDeleted:false}).select({totalPrice:1})
// let Price = (finalPrice).price * (totalItems);
// //let increasedprice = await cartModel.findOneAndUpdate({ userId:user, isDeleted: false }, { $inc: { totalPrice: data.totalPrice += finalPrice } }, { new: true })


// //if(!isValid(totalItems)){return res.status(400).send({status:false, msg:"totalItems required"})}

// let increasedItem = await cartModel.findOneAndUpdate({ userId:user, isDeleted: false }, { $inc: { totalItems: 1 } }, { new: true })


// if(!isValidObjectId(userId)){return res.status(400).send({status:false, msg:"please input valid user"})}

// let checkuser = await UserModel.findOne({_id:userId,isDeleted:false})

// if(!checkuser){return res.status(404).send({status:false, msg:"User not found"})}
//       newCart = {
//         userId,
//         items,
//         totalPrice,
//         totalItems,
//       };
// let savedData = await cartModel.create(newCart)

// return res.status(201).send({msg:savedData})


// }

// const createCart = async function (req, res) {
//     try {
//         // if (req.user.userId != req.params.userId) {
//         //     return res.status(401).send({ status: false, msg: "Invalid userId provided" })
//         // }
//         let userId = req.params.userId
//         let reqBody = req.body
//         const { items } = reqBody
//         if (!isValidObjectId(userId)) {
//             return res.status(400).send({ status: false, msg: "Invalid userId provided" })
//         }
//         if(!isValidRequestBody(reqBody)){
//             return res.status(400).send({ status: false, msg: "provide body" }) 
//         }
//         let findUserCart = await cartModel.findOne({ userId: userId ,items:productId,items:quantity})
//         if (findUserCart) {
//            if (!(items[0].productId && items[0].quantity)) {
//                 return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
//            }
//             var pricearr = []
//             var qtyarr = []

//             let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
//             if (!a) {
//                 res.status(400).send({ status: false, msg: "The product requested is not found" })
//             }
//             let b = items[0].quantity
//             pricearr.push(a.price * b)
//             qtyarr.push(b)

//             let price = pricearr.reduce((pv, cv) => pv + cv)
//             let qty = qtyarr.reduce((pv, cv) => pv + cv)

//             let addProduct = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, { $push: { items: items[0] } }, { new: true })
//             addProduct.totalPrice = addProduct.totalPrice + price
//             addProduct.totalItems = addProduct.totalItems + qty

//             await addProduct.save()

//             return res.status(200).send({ status: true, message: "product added to cart", data: addProduct })
//         } else {
//             if (!(items[0].productId && items[0].quantity)) {
//                 return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
//             }

//             var pricearr = []
//             var qtyarr = []

//             let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
//             if (!a) {
//                 res.status(400).send({ status: false, msg: "The product requested is not found" })
//             }
//             let b = items[0].quantity
//             pricearr.push(a.price * b)
//             qtyarr.push(b)

//             let price = pricearr.reduce((pv, cv) => pv + cv)
//             let qty = qtyarr.reduce((pv, cv) => pv + cv)
//             console.log("from else")
//             let cart = { userId: userId, items: items[0], totalPrice: price, totalItems: qty }
//             await cartModel.create(cart)
//             return res.status(201).send({ status: true, msg: "success", data: cart })
//         }
// }
//  catch (err) {
//         res.status(500).send({ status: false, msg: err.message })
//     }
// }

const createCart = async function (req, res) {
    try {

        let requestBody = req.body
        let cartId = req.body.cartId
        let userId = req.params.userId
        let userIdFromToken = req.userId

        //----------------Validation Starts-------------------------------------//

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide cart details.' })
        }

        // body validation
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in body" })
        }
        // do authorisation here

        

        let isUserIdExists = await UserModel.findOne({ _id: userId })
       
       
        if (!isUserIdExists) {
            return res.status(400).send({ status: false, message: "UserId does not exits" })
        }
        
        // if (isUserIdExists._id.toString() !== userIdFromToken) {
        //     res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
        //     return
        // }
        let cart = await cartModel.findOne({ userId: userId })

        // Extract body
        const { productId, quantity } = requestBody

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId provided" })
        }
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: `No such product present ,unable to add product ${productId} to cart.` })
        }


        if (!(!isNaN(Number(quantity)))) {
            return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
        }
        if (quantity <= 0 || !isValidInteger(quantity)) {
            return res.status(400).send({ status: false, message: `Quantity must be greater than zero and must be an integer ` })
        }


        let isAlredyCartExists = await cartModel.findOne({ userId: userId })

        if (isAlredyCartExists) {

            //---------Total price
            let priceSum = isAlredyCartExists.totalPrice + (product.price * quantity)

            //----------------
            
            let arr = isAlredyCartExists.items
            
            for (i in arr) {
                if (arr[i].productId.toString() === productId) {
                    arr[i].quantity = arr[i].quantity + quantity

                   
                    const updatedCart = {
                        items: arr,
                        totalPrice: priceSum,
                        totalItems: arr.length
                    }
                  

                    let data = await cartModel.findOneAndUpdate({ _id: isAlredyCartExists._id }, updatedCart, { new: true })
                    return res.status(201).send({ status: true, data: data })
                }
           
            }

            arr.push({ productId: productId, quantity: quantity })
            const updatedCart = {
                items: arr,
                totalPrice: priceSum,
                totalItems: arr.length
            }

            let data = await cartModel.findOneAndUpdate({ _id: isAlredyCartExists._id }, updatedCart, { new: true })
            return res.status(201).send({ status: true, data: data })

        }
       
        // TODO----------------------------create new cart

        let priceSum = product.price * quantity
        let itemArr = [{ productId: productId, quantity: quantity }]

        const updatedCart = {
            userId: userId,
            items: itemArr,
            totalPrice: priceSum,
            totalItems: 1
        }

        let data = await cartModel.create(updatedCart)
        res.status(201).send({ status: true, data: data })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error.message });
    }

}




module.exports.createCart=createCart
