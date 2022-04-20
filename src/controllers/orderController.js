const mongoose = require('mongoose');
const UserModel = require("../models/userModel")
const productModel=require("../models/productModel")
const cartModel=require("../models/cartModel")
const orderModel=require("../models/orderModel")


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
const validStatus = function (value) {
    return ["pending", "completed", "cancelled"].indexOf(value) !== -1
}

// const createOrder = async function(req,res){
//     try{
//         let userId = req.params.userId;
        
       
//         if(!isValid(userId)){
//             return res.status(400).send({status:false,msg:"userId is required"})
//         }
//         if(!isValidObjectId(userId)){
//             return res.status(400).send({status:false,msg:"please provide valid userId"})
//         }

//             let cartUser = await UserModel.findOne({_id:userId})
//             if(!cartUser){
//                 return res.status(400).send({status:false,msg:"user not found"})
//             }
//             let cartExists = await cartModel.findOne({userId:userId})
//             if(!cartExists){
//                 return res.status(400).send({status:false,msg:"cart not found for the particular user"})
//             }
//             let cartBody = req.body
//             const { cancellable, status } = cartBody

//             if(!isValidRequestBody(cartBody)){
//                 return res.status(400).send({ status: false, msg: "provide body" }) 
//             }
//             if (!(validStatus(status))) {
//                 return res.status(400).send({ status: false, msg: "Provide a valid status" })
//             }
           
//             let order = {
//                 userId: userId, items: cartExists.items,
//                 totalPrice:cartExists.totalPrice, totalItems: cartExists.totalItems,
//                 totalQuantity: cartExists.totalItems,
//                 cancellable: cancellable, status: status
//             }
//             let newOrder = await orderModel.create(order)
//             res.status(201).send({ status: true, msg: "Successful order created", data: newOrder })
//         } catch (err) {
//             res.status(500).send({ status: false, msg: err.message })
        
//     }
// }

const createOrder = async function (req,res){
    try{
        let userId = req.params.userId
        let data = req.body
        let {items}= data
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let totalQuantity = 0;
        for(let i = 0 ; i<items.length;i++){
            totalQuantity +=items[i].quantity
        }
        data.userId = userId
        data.totalQuantity = totalQuantity
        const orderRes = await orderModel.create(data)
        return res.status(201).send({ status:true, msg: "that is your order",data:orderRes })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const updateOrder=async function (req,res){
    try {
        let data=req.body
        let userId=req.params.userId 

                if(!isValid(userId)){
            return res.status(400).send({status:false,msg:"userId is required"})
        }
        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false,msg:"please provide valid id"})
        }
       
        if(!validStatus(data.status)){
            return res.status(400).send({status:false ,msg:"please provide status"})
        }
        if(!data || data.length>2){
            return res.status(400).send({status:false,msg:"please add only status in the body or body should not be empty"})
        }
        if(!(data.status==="pending"||data.status==="completed"||data.status==='cancled')){
            return res.status(400).send({status:false,msg:"add status only from enum's"}) 
        }

        const findUserId=await orderModel.findOneAndUpdate({userId:userId,_id:data.orderId},{status:data.status},{new:true}) 
        if(!findUserId){
            return res.status(400).send({status:false,msg:"invalid userId"})
        }

        return res.status(200).send({status:true,msg:findUserId})


        
    } catch (error) {
        return res.status(500).send({status:false,msg:error.message})
    }
}


module.exports.createOrder=createOrder
module.exports.updateOrder=updateOrder