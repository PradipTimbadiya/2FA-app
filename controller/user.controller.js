const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const OTPAuth = require('otpauth');
const {encode} = require('hi-base32');
const qrcode = require('qrcode');
const swal = require('sweetalert');

const UserContoller ={
    signUp: async function(req,res){
        try {
            const data = req.body;

            const findUser = await UserModel.findOne({email:data.email});
            if(findUser)
            {
                req.flash("errormsg","User Already Exists");
                return res.redirect('/api/v1/auth/sign-up')
                // const response = { success:false , message:"User Already Exists"};
                // return res.status(400).json(response);
            }

            const createUser = new UserModel(data);
            await createUser.save();

            req.flash("msg","Registration Successfully Done");
            return res.redirect('/api/v1/auth/sign-in')
            // const response = { success:true ,data:createUser, message:"User Created"};
            // return res.status(201).json(response);

        } catch (error) {
            const response = { success:false , message:error.message};
            return res.status(500).json(response);
        }
    },
    signIn: async function(req,res){
        try {
            const {email,password,token} = req.body;

            const findUser = await UserModel.findOne({email});
            if(!findUser)
            {
                req.flash("errormsg","User Not Exists");
                return res.redirect('/api/v1/auth/sign-in')
                // const response = { success:false , message:"User Not Exists"};
                // return res.status(400).json(response);
            }

            const matchPassword = await bcrypt.compare(password,findUser.password);
            if(!matchPassword)
            {
                // const response = { success:false , message:"Something as Wrong"};
                // return res.status(400).json(response);
                req.flash("errormsg","Something as Wrong");
                return res.redirect('/api/v1/auth/sign-in')
            } 

            if(findUser.verify2fa === false)
            {
                // const response = { success:false , message:"Your 2FA Is Not Enable"};
                // return res.status(400).json(response);
                req.flash("errormsg","Your 2FA Is Not Enabl");
                return res.redirect('/api/v1/auth/sign-in')
            }

            let totp = new OTPAuth.TOTP({
                issuer:findUser.email,
                label:findUser.name,
                algorithm:"SHA1",
                digits:6,
                secret:findUser.secret2fa
            })
            const verifyOtp = totp.validate({token});

            if(verifyOtp == null)
            {
                // const response = { success:false , message:"Authentication Failed"};
                // return res.status(400).json(response);
                
                req.flash("errormsg","Authentication Failed");
                return res.redirect('/api/v1/auth/sign-in')
            }

            req.flash("msg","Welcome To Website");
            return res.redirect('/api/v1/auth/home')
            // const response = { success:true ,data:findUser, message:"User LogIn"};
            // return res.status(200).json(response);
        } catch (error) {
            const response = { success:false , message:error.message};
            return res.status(500).json(response);
        }
    },
    enable2FA: async function(req,res){
        try {
            const {email} = req.body;

            const findUser = await UserModel.findOne({email});
            if(!findUser)
            {
                // const response = { success:false , message:"User Not Exists"};
                // return res.status(400).json(response);
                req.flash("errormsg","User Not Exists");
                return res.redirect('/api/v1/auth/enable-2fa')
            }
        
            const generateBase32Secret = () => {
                const buffer = crypto.randomBytes(15);   
                const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
                return base32;
            };

            const base32_secret = generateBase32Secret();

            await UserModel.updateOne({email},{secret2fa:base32_secret})

            let totp = new OTPAuth.TOTP({
                issuer:findUser.email,
                label:findUser.name,
                algorithm:"SHA1",
                digits:6,
                secret:base32_secret
            })

            const qrcode_url = totp.toString();

            qrcode.toDataURL(qrcode_url,(err,qrURl)=>{
                if(err)
                {
                    // const response = { success:false , message:"Sorry Some issue QR Code not genret"};
                    // return res.status(400).json(response);
                    
                    req.flash("errormsg","Sorry Some issue QR Code not genret");
                    return res.redirect('/api/v1/auth/enable-2fa')
                }
                // const response = { success:true , data:{qrcode_url: qrURl,secret:base32_secret}, message:"done"};
                // return res.status(200).json(response);
                
                req.flash("msg","Please Scan This QR Code");
                return res.render('enable2fa',{
                    url:qrURl,
                    msg:req.flash("msg"),
                    errormsg:req.flash("errormsg")
                })
                
            })

        } catch (error) {
            const response = { success:false , message:error.message};
            return res.status(500).json(response);
        }
    },
    verify2FA: async function(req,res){
        try {
            const {email , token} = req.body;

            const findUser = await UserModel.findOne({email});
            if(!findUser)
            {
                // const response = { success:false , message:"User Not Exists"};
                // return res.status(400).json(response);
                req.flash("errormsg","User Not Exists");
                return res.redirect('/api/v1/auth/verify-2fa')
            } 
            
            let totp = new OTPAuth.TOTP({
                issuer:findUser.email,
                label:findUser.name,
                algorithm:"SHA1",
                digits:6,
                secret:findUser.secret2fa
            })
            const verifyOtp = totp.validate({token});

            if(verifyOtp == null)
            {
                // const response = { success:false , message:"Authentication Failed"};
                // return res.status(400).json(response);
                req.flash("errormsg","Authentication Failed");
                return res.redirect('/api/v1/auth/verify-2fa')
            }

            if(!findUser.enable2fa)
            {
                await UserModel.updateOne({_id:findUser.id},{enable2fa:true})
            }
            // req.flash("msg","Verify Done");
            return res.redirect('/api/v1/auth/sign-in')
            // const response = { success:true , message:"Authentication Successfully"};
            // return res.status(200).json(response);

        } catch (error) {
            const response = { success:false , message:error.message};
            return res.status(500).json(response);
        }
    }
}

module.exports = UserContoller;