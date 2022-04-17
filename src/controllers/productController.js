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



const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        
        let finalData = req.body
       
        let productImages
        if (files && files.length > 0) {
        
            if (files[0].mimetype.indexOf('image') == -1)
            return res.status(400).send({status:false,msg:"Only image files are allowed !"})
            productImages = await uploadFile(files[0])
        }
        
        console.log(productImages)
        const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } = finalData
        console.log(finalData)
        data.productImage = productImages
        finalData.productImage = productImages
    
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Please Enter some data" })
           
        if (!isValid(title)) {
            return res.status(404).send({ status: false, msg: "Title is required" })
        }
        const alreadyExsit = await productModel.findOne({ title: title })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "Title already exit" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, msg: "Description is required" })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, msg: "Price is required" })
        }

        if (isValid(price))
            if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
                return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
            }

        if (!isValid(currencyId))
            return res.status(400).send({ status: false, msg: "CurrencyId is required" })

            if(currencyId != 'INR') {
                return res
                .status(400)
                .send({ status: false, message: `${currencyId} is Not A Valid Currency Id` })
            }
        

        if (!isValid(currencyFormat))
            return res.status(400).send({ status: false, msg: "CurrencyFormat is required" })

            if(currencyFormat != '₹') {
                return res
                .status(400)
                .send({ status: false, message: `${currencyFormat} Is Not A Valid Curency Format` })
            }


        const availableSizesEnum = function (availableSizes) {
            return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) !== -1
        }

        if (!availableSizesEnum(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Is not valid size provide S, XS, M, X, L, XXL, XL" })
        }

        const output = await productModel.create(data)
        return res.status(201).send({ msg: "Data uploaded succesfully", data: output })
   // }
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}
// const getSpecificProduct = async function (req, res) {
//     try{
//         let data = {
//             isDeleted: false
//         }
//         let queryDataSize = req.query.size;
//         if (queryDataSize) {
//             if (!(isValid(queryDataSize)) && (isValidSize(queryDataSize))) {
//                 return res.status(400).send("plz Enter a valid Size")
//             }
//             data["availableSizes"] = queryDataSize; //
//         }
//         let name = req.query.name;
//         if (name) {
//             if (!isValid(name)) {
//                 return res.status(400).send("plz enter a valid name")
//             }
//             data["title"] = {$regex: name}
//         }
//         let priceGreaterThan = req.query.priceGreaterThan;
//         if (priceGreaterThan) {
//             if (!isValid(priceGreaterThan)) {
//                 return res.status(400).send("plz enter a valid price")
//             }
//             data["price"] = {
//                 $gte: priceGreaterThan
//             }
//         }
//         let priceLessThan = req.query.priceLessThan;
//         if (priceLessThan) {
//             if (!isValid(priceLessThan)) {
//                 return res.status(400).send("plz enter a valid price")
//             }
//             data["price"] = {
//                 $lte: priceLessThan
//             }
//         }
//         if( priceLessThan && priceGreaterThan){
//             if(!isValid(priceLessThan)){
//                 return res.status(400).send("plz enter a valid price")
//             }
//             if(!isValid(priceGreaterThan)){
//                 return res.status(400).send("plz enter a valid price")
//             }
//             data["price"] = {$lte:priceLessThan,$gte:priceGreaterThan}
    
//         }
//         let filerProduct = await productModel.find(data).sort({price: req.query.price}).sort({price:1})//.skip(8)//.limit(1)//.count();
//         // let filerProduct = await productModel.find({title: {$regex: name}});
//         if (filerProduct.length === 0) {
//             return res.status(400).send({
//                 status: true,
//                 msg: "No product found"
//             })
//         }
//         return res.status(200).send({
//             statu: true,
//             msg: "products you want",
//             data: filerProduct
//         })
//     }catch(error){
//         return res.status(500).send ({status:false, message: error.message})
//     }
// }
// const getSpecificProduct = async (req, res) => {
//     try {
//         const data = req.query;
//         const keys = Object.keys(data);
//         if (keys.length > 0) {
//             const requiredParams = ['size', 'name', 'priceGreaterThan', 'priceLessThan'];
//             let status = false;
//             for (let i = 0; i < keys.length; i++) {
//                 if (!requiredParams.includes(keys[i])) {
//                     status = false;
//                     break;
//                 }
//                 else {
//                     status = true;
//                 }
//             }
//             if (!status) {
//                 return res.status(400).send({
//                     status: false,
//                     message: `Only these Query Params are allowed [${requiredParams.join(", ")}]`
//                 });
//             }

//             let queryData = {};
//             for (let i = 0; i < keys.length; i++) {
//                 if (keys[i] == 'size') {
//                     queryData.availableSizes = data.size;
//                 }
//                 else if (keys[i] == 'name') {
//                     queryData.title = {
//                         $regex: new RegExp(`${data.name}`)
//                     };
//                 }
//                 else if (keys[i] == 'priceGreaterThan') {
//                     queryData.price = {
//                         $gt: data.priceGreaterThan
//                     }
//                 }
//                 else if (keys[i] == 'priceLessThan') {
//                     queryData.price = {
//                         $lt: data.priceLessThan
//                     }
//                 }
//             }
//             if (data['priceGreaterThan'] && data['priceLessThan']) {
//                 queryData.price = {
//                     $gt: data.priceGreaterThan,
//                     $lt: data.priceLessThan
//                 }
//             }
//             queryData.isDeleted = false;
//             queryData.deletedAt = null;

//             const filterData = await productModel.find(queryData).sort({
//                 price: 1
//             });
//             if (filterData.length == 0) {
//                 return res.status(404).send({
//                     status: false,
//                     message: 'Product not found !'
//                 });
//             }

//             return res.status(200).send({
//                 status: true,
//                 message: 'fetch success',
//                 count: filterData.length,
//                 data: filterData
//             });

//         }
//         else {
//             const fetchAllProducts = await productModel.find({
//                 isDeleted: false,
//                 deletedAt: null
//             }).sort({
//                 price: 1
//             });
//             if (fetchAllProducts.length == 0) {
//                 return res.status(404).send({
//                     status: false,
//                     message: 'Product not found !'
//                 });
//             }
//             return res.status(200).send({
//                 status: true,
//                 message: 'fetch success',
//                 count: fetchAllProducts.length,
//                 data: fetchAllProducts
//             });
//         }
//     } catch (error) {
//         return res.status(500).send({
//             status: false,
//             message: error.message
//         });
//     }
// }
const getSpecificProduct = async (req, res) => {

    let {size, name, priceGreaterThan, priceLessThan} = req.query
    let filters ={}

    if(!isValidRequestBody(req.query)) {
        let allData = await productModel.find( { isDeleted : false , deletedAt : null } )
        return res
        .status(200)
        .send({ status: true, message: `Success`, Data: allData })
    }

    if(req.query.hasOwnProperty('size')) {

        let validSizes = isValidSize(size)
        if(!validSizes) {
            return res
            .status(400)
            .send({ status: false, message: `please Provide Available Size from ${["S", "XS","M","X", "L","XXL", "XL"]}` })
        }
        filters['availableSizes'] = { $in : validSizes }
    }

    if( 'name' in req.query ) {

        if(!isValid(name)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid Input - Name` })
        }
        filters['title'] = { $regex : name }

    }

    if( 'priceGreaterThan' in req.query && 'priceLessThan' in req.query  ) {

        if(!validate.isValidNumber(priceGreaterThan )) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        if(!isValidNumber(priceLessThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }
        
        filters['price'] = { $gt : priceGreaterThan, $lt : priceLessThan }
        
    }else if( 'priceGreaterThan' in req.query ) {

        if(!isValidNumber(priceGreaterThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $gt : priceGreaterThan }

    }else if( 'priceLessThan' in req.query ) {

        if(!isValidNumber(priceLessThan)) {
            return res
            .status(400)
            .send({ status: false, message: `invalid price - Enterd` })
        }

        filters['price'] = { $lt : priceLessThan }

    }

    // console.log(filters)

    const dataByFilters = await productModel.find(filters)
    return res
    .status(200)
    .send({ status: true, message: `Success`, Data: dataByFilters })

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
const updateProduct = async function (req, res)  {

    try {
        let data = req.body
        const id = req.params.productId
        let files=req.files
        let finalData=req.body

        let productImagessweetselfie
        if (files && files.length > 0) {
            if (files[0].mimetype.indexOf('image') == -1)
            return res.status(400).send({status:false,msg:"Only image files are allowed !"})
            productImagessweetselfie = await uploadFile(files[0])
        }
       
        console.log(productImagessweetselfie)
        const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } = finalData
        console.log(finalData)
        data.productImage = productImagessweetselfie
        finalData.productImage = productImagessweetselfie

       // const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes, installments } = data
    
        if (!isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${id} is not a valid book id ` })
            return
        }
        let titleUsed = await productModel.findOne({ title })
        if (titleUsed) {
            return res.status(400).send({ status: false, message: "title must be Unique" })  
        }
        if (isValid(price))
        if (!(/(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/).test(price)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid Amount" })
        }

        if (!Object.keys(data).length > 0) return res.send({ status: false, message: "Please enter data for updation" })

        const productPresent = await productModel.findById({ _id: id })

        if (!productPresent) return res.status(404).send({ status: false, message: "product not found" })

        

        if (data.isDeleted == true) {
            data.deletedAt = moment().format("YYYY-MM-DD")
        }
        

        const update = await productModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: data }, { new: true })

        if (!update) return res.status(400).send({ status: false, message: "product is Deleted" })

        return res.status(200).send({ status: true, message: `${Object.keys(data).length} field has been updated successfully !`, data: update })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

// const updateProduct = async (req, res) => {
//     try {
//         const productId = req.params.productId;
//         const data = req.body;
//         const file = req.files;

//         if (!isValidObjectId(productId)) {
//             return res.status(400).send({
//                 status: false,
//                 message: 'Only mongodb object id is allowed !'
//             });
//         }
//         const productRes = await productModel.findById(productId);
//         if (!productRes) {
//             return res.status(404).send({
//                 status: false,
//                 message: 'Product not found !'
//             });
//         }
//         if (productRes.isDeleted && productRes.deletedAt != null) {
//             return res.status(404).send({
//                 status: false,
//                 message: 'Product not found !'
//             });
//         }
//         if (file && file.length > 0) {
//             if (file[0].mimetype.indexOf('image') == -1) {
//                 return sendResponse(res, 400, false, 'Only image files are allowed !');
//             }
//            const profile_url = await uploadFile(file[0]);
//            data.productImage = profile_url;
//          }
//         const updateRes = await productModel.findByIdAndUpdate(productId, data, {
//             new: true
//         });
//         return res.status(200).send({
//             status: true,
//             message: `${Object.keys(data).length} field has been updated successfully !`,
//             data: updateRes
//         });

//     } catch (error) {
//         if (error.code == 11000) {
//              const key = Object.keys(error['keyValue']);
//             return res.status(400).send({
//                 status: false,
//                 message: `[${error['keyValue'][key]}] ${key} is already exist ! `
//             });
//         }
//         return res.status(500).send({
//             status: false,
//             message: error.message
//         });
//  }
// }


const deleteProduct = async  function(req, res)  {
    try {
        const data = req.params.productId
        
      if (!isValid(data)) {
        return  res.status(400).send({ status: false, message: "Please , provide productId in path params" })
          
        }
        if (!isValidObjectId(data)) {
         return  res.status(400).send({ status: false, message: `${data} is not a valid book id ` })
            
        }
        const product = await productModel.findById(data)
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