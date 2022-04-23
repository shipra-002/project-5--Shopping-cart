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


// const createCart = async function (req, res) {
//     try {

//         let requestBody = req.body
//         let cartId = req.body.cartId
//         let userId = req.params.userId
        
        
//         if (!isValidRequestBody(requestBody)) {
//             return res.status(400).send({ status: false, message: 'please provide cart details.' })
//         }

        
//         if (!isValidObjectId(userId)) {
//             return res.status(400).send({ status: false, message: "Invalid userId " })
//         }
    

//         let isUserExists = await UserModel.findOne({ _id: userId })
       
       
//         if (!isUserExists) {
//             return res.status(400).send({ status: false, message: "UserId does not exits" })
//         }
        
        
//         let cart = await cartModel.findOne({ userId: userId })

        
//         const { productId, quantity } = requestBody

//         if (!isValidObjectId(productId)) {
//             return res.status(400).send({ status: false, message: "Invalid productId " })
//         }
//         let product = await productModel.findOne({ _id: productId, isDeleted: false })
//         if (!product) {
//             return res.status(400).send({ status: false, message: `No product found ${productId} .` })
//         }


//         if (!(!isNaN(Number(quantity)))) {
//             return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
//         }
//         if (quantity <= 0 || !isValidInteger(quantity)) {
//             return res.status(400).send({ status: false, message: `Quantity must be an integer !! ` })
//         }


//         let isCartExists = await cartModel.findOne({ userId: userId })

//         if (isCartExists) {

           
//             let price = isCartExists.totalPrice + (product.price * quantity)

        
//             let array = isCartExists.items
            
//             for (i in array) {
//                 if (array[i].productId.toString() === productId) {
//                     array[i].quantity = array[i].quantity + quantity

                   
//                     const newCart = {
//                         items: array,
//                         totalPrice: price,
//                         totalItems: array.length
//                     }
                  

//                     let data = await cartModel.findOneAndUpdate({ _id: isCartExists._id }, newCart, { new: true })
//                     return res.status(201).send({ status: true,msg:"cart created", data: data })
//                 }
           
//             }

//             array.push({ productId: productId, quantity: quantity })
//             const newCart = {
//                 items: array,
//                 totalPrice: price,
//                 totalItems: array.length
//             }

//             let data = await cartModel.findOneAndUpdate({ _id: isCartExists._id }, newCart, { new: true })
//             return res.status(201).send({ status: true,msg:"cart created", data: data })

//         }
       

//         let price = product.price * quantity
//         let itemArr = [{ productId: productId, quantity: quantity }]

//         const newCart = {
//             userId: userId,
//             items: itemArr,
//             totalPrice: priceSum,
//             totalItems: 1
//         }

//         let data = await cartModel.create(newCart)
//         res.status(201).send({ status: true,msg:"cart created", data: data })

//     }
//     catch (error) {
//         console.log(error)
//         res.status(500).send({ status: false, data: error.message });
//     }

// }

const createCart = async function(req, res) {
    try{
    let userId = req.params.userId;
    let data = req.body
    let items2 
    if(!(isValid(userId))&&(isValidObjectId(userId))){
        return res.status(400).send({status:false, message:"Please provide a valid userId"})
    }
    if (!isValidRequestBody(data)) {
      return res.status(400).send({status: false, message: "Plaese Provide all required field" })
  }
     let items = data.items
     if (typeof(items) == "string"){
        items = JSON.parse(items)
    }
     const isCartExist = await cartModel.findOne({userId:userId})
     let totalPrice = 0;
     if(!isCartExist){
        for(let i = 0; i < items.length; i++){
          let productId = items[i].productId
          let quantity = items[i].quantity
           let findProduct = await productModel.findOne({_id:productId,isDeleted:false});
           if(!findProduct){
            return res.status(400).send({status:false, message:"product is not valid or product is deleted"})
           }
           totalPrice = totalPrice + (findProduct.price*quantity)
         }
        let createCart = await cartModel.create({userId:userId,items:items,totalPrice:totalPrice,totalItems:items.length })
        
        return res.status(201).send({status:true,msg:"success",data:createCart})
     } if(isCartExist){
          items2 = isCartExist.items
     }
        let findProduct = await productModel.findOne({_id:items[0].productId,isDeleted:false})
        if(!findProduct){
          return res.status(400).send({status:false, message:"product is not valid"})
         }
       // res.send(findProduct)
        let totalPrice2 = findProduct.price
        let newquantity = items[0].quantity
        let flag = 0
        
           for(let i = 0; i < items2.length; i++){
               let productId = items2[i].productId
            if(productId == items[0].productId){
                   flag = 1
                   items2[i].quantity = items2[i].quantity + newquantity}
               
   }    totalPrice2 = Math.round(totalPrice2 * newquantity + isCartExist.totalPrice) 
        if(flag == 0){
            items2.push(items[0])
        }
       let updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:items2,totalPrice:totalPrice2,totalItems:items2.length}},{new:true})
               return res.status(200).send(updateCart)
   }catch (error) {
    return res.status(500).send({ status: false, ERROR: error.message })
}
}



const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body
        // console.log(removeProduct )

        const key = Object.keys(req.body)

        if (key == 0) {
            return res.status(400).send({ status: false, msg: "please enter some data" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is required" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" })
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }

        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, msg: "removeProduct is required" })
        }

        let cartData = await cartModel.findById(cartId)
        console.log(cartData)
        if (!cartData) { return res.status(404).send({ status: false, msg: "cartData not found !" }) 
    }
   
        
        if (removeProduct == 0) {
            let items = []
            let dataObj = {}
            let removePrice = 0
            
            for (let i = 0; i < cartData.items.length; i++) {
                console.log(cartData.items.length )

                if (cartData.items[i].productId != productId) {
                    return res.status(400).send({ status: false, msg: "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    removePrice = productRes.price * cartData.items[i].quantity
                }
                items.push(cartData.items[i])

            }
            productPrice = cartData.totalPrice - removePrice
            dataObj.totalPrice = productPrice
            dataObj.totalItems = items.length
            dataObj.items = items
            const removeRes = await cartModel.findOneAndUpdate({ productId: productId }, dataObj, { new: true })
            return res.status(200).send({ status: true, message: "remove success", data: removeRes })

        }
        if(removeProduct == 1) {
            let dataObj = {}
            let item =[]
            let productPrice = 0
            for (let i = 0; i < cartData.items.length; i++) {
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    item.push({productId:productId,quantity:cartData.items[i].quantity - 1})
                    dataObj.totalPrice = cartData.totalPrice - productRes.price
                    dataObj.totalItems = item.length
                    dataObj.items = item
                }
                if (cartData.items[i].productId != productId) {
                    console.log(productId )
                    console.log(cartData.items[i].productId  )
                    return res.status(400).send({ status: false, msg:  "product not found in the cart" })}
             
               
                
            
                const reduceData = await cartModel.findOneAndUpdate({productId:productId},dataObj,{new:true})

                return res.status(200).send({ status: true, message: "success", data:reduceData})

            }

        }
        else{
            return res.status(400).send({ status: false, msg: "removeProduct field should be allowed only 0 and 1 " }) 
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//

const getcartbyId = async function (req, res) {
    try {

        let userId = req.params.userId;
       
       
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "please provide valid userId" });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId" });
        }
        let user= await UserModel.findOne({_id:userId})
        if (!user) {
            return res.status(400).send({ status: false, msg: "user not found" });
        }
        let cartUser = await cartModel.findOne({ userId: userId });
        if (!cartUser) {
            return res.status(400).send({ status: false, msg: "cart not found" });
        }
       
        return res.status(200).send({ status: true,msg:"cart details", data:  cartUser })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error.message });
    }
}
//
const deletecartbyId = async function (req, res) {
    try {
        let userId = req.params.userId;
      
       
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "please provide valid userId" });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid user Id" });
        }
       
        let userCartData = await UserModel.findOne({ _id: userId })
        if (!userCartData) {
            return res.status(400).send({ status: false, msg: "user not found" });
        }
       
        let usercart = await cartModel.findOne({ userId: userId })
        if (!usercart) {
            return res.status(400).send({ status: false, msg: "No such user found. Please register and try again" });
        }
        let updatedUserCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        return res.status(204).send({ status: true})
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false,msg:"deleted cart" ,data: error.message });
    }
}
    


module.exports.createCart=createCart
module.exports.updateCart=updateCart
module.exports.getcartbyId=getcartbyId
module.exports.deletecartbyId=deletecartbyId