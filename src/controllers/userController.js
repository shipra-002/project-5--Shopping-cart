const UserModel = require("../models/userModel")
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")
const aws = require("aws-sdk")
var bcrypt = require('bcryptjs');



const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidImage = (image) => {
    if ( /.*\.(jpeg|jpg|png)$/.test(image.originalname) ) {
        return true
    }
    return false
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

//---------------------------------------------------------------------------------------//
const createUser = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let address = JSON.parse(req.body.address)


        const { fname, lname, email, phone, password } = data
        let profileImagessweetselfie
        if (files && files.length > 0) {
            if (files[0].mimetype.indexOf('image') == -1)
                return res.status(400).send({ status: false, msg: "Only image files are allowed !" })
            profileImagessweetselfie = await uploadFile(files[0])
        }
        console.log(profileImagessweetselfie)
        const encryptedpassword = await bcrypt.hash(password, 10)
        const finalData = { fname: fname, lname: lname, email: email, phone: phone, password: encryptedpassword, address: address }
        console.log(finalData)
        data.profileImage = profileImagessweetselfie
        finalData.profileImage = profileImagessweetselfie
        data.address = address
        // const output = await userModel.create(data,address)

        /*****************************8 */
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Please Enter some data" })

        if (!isValid(data.fname)) {
            return res.status(400).send({ status: false, msg: "fname is Required" })

        }
        if (!isValid(data.lname)) {
            return res.status(400).send({ status: false, msg: "lname is Required" })
        }
        if (!isValid(data.phone)) {
            return res.status(400).send({ status: false, msg: "phone is Required" })
        }
        const alreadyExsit = await UserModel.findOne({ phone: data.phone })
        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "phone already exits" })
        }
        if (isValid(data.phone))

            if (!(/^([+]\d{2})?\d{10}$/.test(data.phone)))
                return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })

        if (!isValid(data.email)) {
            return res.status(400).send({ status: false, msg: "email is Required" })
        }
        if (isValid(data.email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
                return res.status(400).send({ status: false, msg: "is not a valid email" })

        let alreadyExistEmail = await UserModel.findOne({ email: data.email })
        if (alreadyExistEmail) {
            return res.status(400).send({ status: false, msg: "email already exit" })
        }

        if (!isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "Password is Required" })
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }

        if (!isValid(data.profileImage)) {
            return res.status(400).send({ status: false, msg: "ProfileImage is Required" })
        }
        if (!address) {
            return res
            .status(400)
            .send({ status: false, message: 'address is required' })
        }
        if (!isValid(address['shipping']['street'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping Street' })
        }
        if (!isValid(address['shipping']['city'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping city' })
        }
        if (!isValid(parseInt(address['shipping']['pincode']))) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid Shipping Pincode' })
        }
        if (isValid(address['shipping']['pincode']))

            if (!(/^([+]\d{2})?\d{6}$/.test(address['shipping']['pincode'])))
                return res.status(400).send({ status: false, msg: "Please Enter  a Valid pincode Number" })

         if (!isValid(address['billing']['street'])) {
            return res
            .status(400)
            .send({ status: false, message: 'invalid billing Street' })
        }
        if (!isValid(address['billing']['city'])) {
            return res.status(400).send({ status: false, msg: "billing city is Required" })
        }
        if (!isValid(address['billing']['pincode'])) {
            return res.status(400).send({ status: false, msg: " billing pincode is Required" })
        }
        if (!(/^([+]\d{2})?\d{6}$/.test(address['billing']['pincode'])))
            return res.status(400).send({ status: false, msg: "Please Enter  a Valid billing  pincode Number" })

        

        const output = await UserModel.create(finalData)
        return res.status(201).send({ msg: "Data uploaded succesfully", data: output })

    }

    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: err.message })
    }
}



const loginUser = async function(req, res){
    try{
        let data = req.body
        if(!data){
            return res
            .status(400)
            .send({status:false, msg:"data required for login"})
        }
        let email = req.body.email
        let password = req.body.password
    
        if(!isValid(email)){
            return res
            .status(400)
            .send({status:false, msg:"email is requires"})
        }
    
        let Email = email
                let validateEmail = function (Email) {
                    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email);
                }
                if (!validateEmail(Email)) {
                    return res.status(400).send({ status: false, message: "Please enter a valid email" })
                }
    
        let isUserExist = await UserModel.findOne({email})
    
        if(!isUserExist){
            return res
            .status(404)
            .send({status:false, msg:" User Not Found Please Check Email"})
        }
    
        if(!isValid(password)){
            return res
            .status(400)
            .send({status:false, msg:"password is required"})
        }
    
        // if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(data.password))) {
        //     return res.status(400).send({ status: false, msg: "please provide valid password" })
        // }
    
        let pass = isUserExist.password

        let check = await bcrypt.compare(password,pass)
        
        if(!check){return res.status(400).send({status:false, msg: "password is incorrect"})}
    
        let token = jwt.sign(
            {
                userId:isUserExist._id.toString(),
                iat: Math.floor(Date.now() / 1000),
               exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60
            },
            "projectfiveshoppingkart",
            
        );
        res.setHeader("authorization", token)
        res
        .status(200)
        .send({status:true, message: 'user Login SuccessFull', data:{ userId:isUserExist._id, token }}),{_id:1}
    
    }catch(err){
        res.status(500).send({ status: false, message: err.message })
    }
    }
    //
    
const getUser = async function (req, res) {
    try {
        const userId = req.params.userId


        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please , provide userId in path params" })

        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: 'please provide a valid userId' })
        }
        const isPresent = await UserModel.findById({ _id: userId })

        if (!isPresent) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        const userData = await UserModel.findById({ _id: userId })

        return res.status(200).send({ status: true, message: "User profile details", data: userData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateUser = async (req, res) => {
    try {
        const { userId } = req.params
        let files = req.files
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid ID" })
        }
        const data = req.body // JSON.parse(JSON.stringify(req.body)) 
        const {fname,lname,email,phone, password ,address} = data
      
        const isUserExist = await UserModel.findById(userId)
        if (!isUserExist) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        if (data._id) {
            return res.status(400).send({ status: false, message: "can not update user id" })
        }
        if (isValid(data.email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
                return res.status(400).send({ status: false, msg: "is not a valid email" })
        if (data.email) {
            const isEmailInUse = await UserModel.findOne({ email: data.email })
            if (isEmailInUse) {
                return res.status(400).send({ status: false, message: "email already registered, enter different email" })
            }
        }
        if (isValid(data.phone))

        if (!(/^([+]\d{2})?\d{10}$/.test(data.phone)))
            return res.status(400).send({ status: false, msg: "Please Enter  a Valid Phone Number" })

        if (data.phone) {
            const isPhoneInUse = await UserModel.findOne({ phone: data.phone })
            if (isPhoneInUse) {
                return res.status(400).send({ status: false, message: "phone number already registered, enter different number" })
            }
        }
        
       
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "please provide valid password" })
        }
        let salt=10
        if (password) {
            const hash = await bcrypt.hash(password, salt)
            data.password = hash
        }
        const add = JSON.parse(JSON.stringify(isUserExist.address))
        // return res.send(add)
        if (data.address) {
            data.address = JSON.parse(data.address)
            // return res.send(data)
            if (data.address.shipping) {
                if (data.address.shipping.street) {
                    if (!isValid(data.address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "please enter shipping street name" })
                    }
                    add.shipping.street = data.address.shipping.street
                }
                if (data.address.shipping.city) {
                    if (!isValid(data.address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "please enter shipping city name" })
                    }
                    add.shipping.city = data.address.shipping.city
                }
                if (data.address.shipping.pincode) {
                    if (!isValid(data.address.shipping.pincode)) {
                        return res.status(400).send({ status: false, message: "please enter shipping pincode" })
                    }
                    if (!(/^([+]\d{2})?\d{6}$/.test(data.address.shipping.pincode)))
                    return res.status(400).send({ status: false, msg: "Please Enter  a Valid shipping  pincode Number" })
                    add.shipping.pincode = data.address.shipping.pincode
                }
            }
            if (data.address.billing) {
                if (data.address.billing.street) {
                    if (!isValid(data.address.billing.street)) {
                        return res.status(400).send({ status: false, message: "please enter billing street name" })
                    }
                    add.billing.street = data.address.billing.street
                }
                if (data.address.billing.city) {
                    if (!isValid(data.address.billing.city)) {
                        return res.status(400).send({ status: false, message: "please enter billing city name" })
                    }
                    add.billing.city = data.address.billing.city
                }
                if (data.address.billing.pincode) {
                    if (!isValid(data.address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: "please enter billing pincode" })
                    }
                    if (!(/^([+]\d{2})?\d{6}$/.test(data.address.billing.pincode)))
                    return res.status(400).send({ status: false, msg: "Please Enter  a Valid billing  pincode Number" })
                    add.billing.pincode = data.address.billing.pincode
                }
            }

            data.address = add
        }
        if (files.length > 0) {
            image = await uploadFile(files[0])
            data.profileImage=image
        }
        // return res.send(data.address)
        const updateUser = await UserModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        return res.status(200).send({ status: true,msg:`${Object.keys(data).length} field has been updated successfully !`, data: updateUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}







module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUser = getUser
module.exports.updateUser = updateUser





