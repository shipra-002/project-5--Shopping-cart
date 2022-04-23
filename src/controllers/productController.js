const productModel = require("../models/productModel")
const mongoose = require('mongoose');
const aws = require("aws-sdk") 
const moment = require("moment")


const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidNumber = (value) => {
    return (!isNaN(value) && value > 0)
}

const isValidInteger = function isInteger(value) {
    return value % 1 == 0;
}

const isValidImage = (image) => {
    if ( /.*\.(jpeg|jpg|png)$/.test(image.originalname) ) {
        return true
    }
    return false
}


const isValidBoolean = (value) => {
    return ( value === "true" || value === "false" )
}

const isValidFiles = (requestFiles) => {
    return requestFiles.length > 0 
}


const isValidSize = (Arr) => {
    let newArr = []
    if(!Arr.length > 0)
    return false

    for(let i =  0 ; i< Arr.length ; i++) {
        if(!["S", "XS","M","X", "L","XXL", "XL"].includes(Arr[i].toUpperCase())) {
        return false
    }
    newArr.push(Arr[i].toUpperCase())
    }
return newArr
}
const validString = function(value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

/************************************ */
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group23/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        }
        )

    }
    )
}



const createProduct = async (req, res) => {
    try {
        
        if(!isValidRequestBody(req.body)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid request params` })
        }
    
        let files = req.files
        if (files && files.length > 0) {
            if(!isValidImage(files[0])) {
                return res
                .status(400)
                .send({ status: false, message: `invalid image type` })
            }
    
        } 
        else {
          return res
          .status(400)
          .send({ status: false, msg: "please provide image" });
        }
    
        let {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            availableSizes,
            installments
        } = req.body
        
        if(!isValid(title)) {
            return res
            .status(400)
            .send({ status: false, message: `title is required` })
        }
    
        let titleUsed = await productModel.findOne({ title })
            if (titleUsed) {
                return res.status(400).send({ status: false, message: "title must be Unique" })  
             }
    
    
        if(!isValid(description)) {
            return res
            .status(400)
            .send({ status: false, message:`invalid Discription` })
        }
        if (!isValid(price)) {
            return res.status(400).send({ status: false, msg: "Price is required" })
        } 

        if (isValid(price))
            if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
            }
    
        if(!isValid(currencyId)) {
            return res
            .status(400)
            .send({ status: false, message: `please Provide Currency Id Field` })
        }
    
        if(currencyId != 'INR') {
            return res
            .status(400)
            .send({ status: false, message: `${currencyId} is Not A Valid Currency Id` })
        }
    
        if(!isValid(currencyFormat)) {
            return res
            .status(400)
            .send({ status: false, message: `please Provide CurrencyFormat Field` })
        }
    
        if(currencyFormat != '₹') {
            return res
            .status(400)
            .send({ status: false, message: `${currencyFormat} Is Not A Valid Curency Format` })
        }
    
        if(!isValid(isFreeShipping)) {
            return res
            .status(400)
            .send({ status: false, message: `Freeshipping Field Should Be Present` })
        }
    
        if(!isValidBoolean(isFreeShipping)) {
            return res
            .status(400)
            .send({ status: false, message: `is Free Shipping Should Be a Boolean value` })
        }
    
        if(!isValid(style)){
            return res.status(400).send({ status: false, message: `This style should not be available`})
        }
       
        if(!availableSizes) {
            return res
            .status(400)
            .send({ status: false, message: `please Provide Avilable Sizes` })
        }
    
        if(availableSizes.length === 0) {
            return res
            .status(400)
            .send({ status: false, message: ` In Valid Input` })
        }
       
        const SizesEnum = function (availableSizes) {
      return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(availableSizes) !== -1
    }
       if(!SizesEnum(availableSizes)){
    return res.status(400).send({status:false, msg:"Is not valid available Sizes provide S, XS, M, X, L, XXL, XL "})
    }
    
        if(installments) {
            if(!parseInt(installments) ) {
                return res.status(400).send({ status: false, message: `Invalid installments`})
            }
        }
         
        let uploadedFileURL = await uploadFile(files[0])
        console.log(uploadedFileURL)
    
    
        let finalData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            productImage : uploadedFileURL,
            style,
            availableSizes,
            installments
        }
    
        const newProduct = await productModel.create(finalData)
        return res
        .status(201)
        .send({ status: true, mesage:'success', Data: newProduct })
    
    } catch (err) {
        res
        .status(500)
        .send({ status: false, message: err.message })
    }
    }

const getSpecificProduct = async function (req, res) {
    try{
        let data = {
            isDeleted: false
        }
        let queryDataSize = req.query.size;
        if (queryDataSize) {
            if (!(isValid(queryDataSize)) && (isValidSize(queryDataSize))) {
                return res.status(400).send("plz Enter a valid Size")
            }
            data["availableSizes"] = queryDataSize; //
        }
        let name = req.query.name;
        if (name) {
            if (!isValid(name)) {
                return res.status(400).send("plz enter a valid name")
            }
            data["title"] = {$regex: name}
        }
        let priceGreaterThan = req.query.priceGreaterThan;
        if (priceGreaterThan) {
            if (!isValid(priceGreaterThan)) {
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {
                $gte: priceGreaterThan
            }
        }
        let priceLessThan = req.query.priceLessThan;
        if (priceLessThan) {
            if (!isValid(priceLessThan)) {
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {
                $lte: priceLessThan
            }
        }
        if( priceLessThan && priceGreaterThan){
            if(!isValid(priceLessThan)){
                return res.status(400).send("plz enter a valid price")
            }
            if(!isValid(priceGreaterThan)){
                return res.status(400).send("plz enter a valid price")
            }
            data["price"] = {$lte:priceLessThan,$gte:priceGreaterThan}
    
        }
        let filerProduct = await productModel.find(data).sort({price: req.query.priceSort})//.skip(8)//.limit(1)//.count();
        // let filerProduct = await productModel.find({title: {$regex: name}});
        if (filerProduct.length === 0) {
            return res.status(400).send({
                status: true,
                msg: "No product found"
            })
        }
        return res.status(200).send({
            status: true,
            msg: "success",
            data: filerProduct
        })
    }catch(error){
        return res.status(500).send ({status:false, message: error.message})
    }
}


const getproductbyId = async function(req,res){
    try{
        const productId = req.params.productId
      

      if (!isValid( productId)) {
      return  res.status(400).send({ status: false, message: "Please , provide productId in path params" })
        
      }
      if(!isValidObjectId( productId)){
        return res.status(400).send({status:false,msg:'please provide a valid productId'})
    }
    const isPresent = await productModel.findById({ _id: productId })

    if (!isPresent){
     return res.status(404).send({ status: false, message: "product not found" })
    }
    const productData = await productModel.findById({_id: productId})

    return res.status(200).send({ status: true, message: "product details", data: productData })
} catch (error) {
    return res.status(500).send({ status: false, message: error.message })
}
} 



// const updateProduct = async function(req,res) {
//     try {
//         // Validate body
//         const body = req.body
//         //  if (!Object.keys(body || files).length > 0) return res.send({ status: false, message: "Please enter data for updation" })
      

//         const productId = req.params.productId;
//          if (!isValidObjectId(productId)) {
//           return  res.status(400).send({ status: false, message: `${productId} is not a valid product id ` })
            
//         }


//         const {title, description, price, isFreeShipping, style, availableSizes, installments} = body
//           let titleUsed = await productModel.findOne({ title })
//         if (titleUsed) {
//             return res.status(400).send({ status: false, message: "title must be Unique" })  
//         }
//               if (isValid(price))
//         if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
//             return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
//         }
//         const SizesEnum = function (availableSizes) {
//             return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(availableSizes) !== -1
//           }
//              if(!SizesEnum(availableSizes)){
//           return res.status(400).send({status:false, msg:"Is not valid available Sizes provide S, XS, M, X, L, XXL, XL "})
//           }
//           if(!isValidBoolean(isFreeShipping)) {
//             return res
//             .status(400)
//             .send({ status: false, message: `is Free Shipping Should Be a Boolean value` })
//         }
//         if(installments) {
//             if(!parseInt(installments) ) {
//                 return res.status(400).send({ status: false, message: `Invalid installments`})
//             }
//         }
//         if(!isValid(style)){
//             return res.status(400).send({ status: false, message: `This style should not be available`})
//         }
//         const searchProduct = await productModel.findOne({_id: productId, isDeleted: false})
//         if(!searchProduct) {
//             return res.status(404).send({status: false, msg: "ProductId does not exist"})
//         }

//         let files = req.files;
//         if (files && files.length > 0) {
//         var uploadedFileURL = await uploadFile( files[0] );
//         body.productImage
//         }
//         const finalproduct = {
//             title, description, price, currencyId: "₹", currencyFormat: "INR",isFreeShipping, productImage: uploadedFileURL, style, availableSizes, installments
//         }
         

//         let updatedProduct = await productModel.findOneAndUpdate({_id:productId}, finalproduct, {new:true})
//         return res.status(200).send({status: true, msg: "Updated Successfully", data: updatedProduct}) 
        
//     }
//     catch (err) {
//         console.log("This is the error :", err.message)
//         res.status(500).send({ msg: "Error", error: err.message })
//     }
// }

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/.test(productId.trim()))) {
            return res.status(400).send({
                status: false,
                message: 'Please provide valid product id in Params'
            })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(400).send({
                status: false,
                message: `Provided ProductId ${productId} Does not exists`
            })
        }

        let updateBody = req.body

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = updateBody

        let files = req.files
        if (files) {
            if (Object.keys(files).length != 0) {
                const updateProductImage = await uploadFile(files[0]);
                updateBody.productImage = updateProductImage;
            }
        }

        if (!isValidRequestBody(updateBody)) {
            return res.status(400).send({
                status: false,
                message: 'Please, provide some data to update'
            })
        }

        if (!validString(title)) {
            return res.status(400).send({
                status: false,
                message: 'Title cannot be empty'
            })
        }

        let duplicateTitle = await productModel.findOne({ title: title })

        if (duplicateTitle) {
            return res.status(400).send({
                status: false,
                message: 'Title is already exist'
            })
        }

        if (currencyId) {
            if (!(currencyId == 'INR')) {
                return res.status(400).send({
                    status: false,
                    message: 'currencyId should be a INR'
                })
            }
        }
       

        if (installments) {
            if (installments % 1 != 0) {
                return res.status(400).send({
                    status: false,
                    message: 'installments cannot be a decimal value'
                })
            }
        }
       
        if(currencyFormat){
        if (currencyFormat != '₹') {
            return res.status(400).send({
                status: false,
                message: `${currencyFormat} Is Not A Valid Curency Format`
            })
        }
    }
    

        if (isValid(price))
        if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
        }
        
        if (isFreeShipping) {
            if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {
                return res.status(400).send({
                    status: false,
                    message: 'isFreeShipping should be a boolean value'
                })
            }
        }
        let Arr = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
        if (!isValidSize(availableSizes)) {
            let newArr = availableSizes.split(',').map(x => x.trim())
            for (let i = 0; i < newArr.length; i++) {
                if (!(Arr.includes(newArr[i]))) {
                    return res.status(400).send({
                        status: false,
                        message: `availableSizes should be among [${Arr}]`
                    })
                }
            }
            updateBody.availableSizes = newArr
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId },
            {
                $set:
                {
                    title: title,
                    description: description,
                    price: price,
                    currencyId: currencyId,
                    isFreeShipping: isFreeShipping,
                    style: style,
                    availableSizes: availableSizes,
                    productImage: updateBody.productImage,
                    installments: installments
                }
            }, { new: true })
        return res.status(200).send({
            status: true,
            msg:"update product",
            product: updatedProduct
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            error: error.message
        })
    }
}


const deleteProduct = async  function(req, res)  {
    try {
        const data = req.params.productId
        
      if (!isValid(data)) {
        return  res.status(400).send({ status: false, message: "Please , provide productId in path params" })
          
        }
        if (!isValidObjectId(data)) {
         return  res.status(400).send({ status: false, message: `${data} is not a valid book id ` })
            
        }
        const product = await productModel.findById({_id:data})
        if (!product) {
            return res.status(404).send({ status: false, message: "product not found" })
        }
        if (product.isDeleted == true) {
            return res.status(400).send({ status: false, message: "product is already deleted" })
        }
        const delProduct = await productModel.findByIdAndUpdate(data, { isDeleted: true, deletedAt: moment().format("YYYY-MM-DD") }, { new: true })
        return res.status(200).send({ status: true, message: "success", data: delProduct })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
    
module.exports.createProduct=createProduct
module.exports.getproductbyId=getproductbyId
module.exports.getSpecificProduct=getSpecificProduct
module.exports.deleteProduct=deleteProduct
module.exports.updateProduct=updateProduct