const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


async function loginUser(req,res){
     try {
        const { email , password } = req.body;

        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(400).json({
                message:"Invalid Passowrd!"
            })
        }

        if(!user.isActive){
            return res.status(403).json({
                message:"User is Inactive"
            })
        }

        const token =  jwt.sign(
            {
                userId:user._id,
                role:user.role,
                hospitalId:user.hospitalId
            },
            process.env.JWT_SECRET,
            {expiresIn:"1d"}
        );

        res.cookie('token',token,{
            httpOnly: true, // Prevents JavaScript access (XSS protection)
            secure: true,   // Ensures cookie is only sent over HTTPS
            sameSite: 'strict', // Protects against CSRF attacks
            maxage: 24 * 60 * 60 * 1000 // 1 day
        })

         user.lastLogin = new Date();
         await user.save();

         res.status(200).json({
            message:"You login successfully",
            token,
            user:{
                name:user.name,
                role:user.role
            }
         })

     } catch (error) {
        res.status(500).json({ message: error.message });
     }
}




module.exports = {
    loginUser
}