const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const config = require("config");
const bcrypt = require("bcrypt");

router.post('/',[
    check('email',"Please enter a valid email address").isEmail(),
    check('password', 'password cannot be less than 8 characters and cannot be more that 12 characters').isLength({min:8,max:12}),
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({errors: error.array()});
    }
    const {email, password} = req.body;
    try{
        const user_found = await User.findOne({email})
        if(!user_found){
            return res.status(404).json({error:{msg:"User not found"}})
        }
        const check = await bcrypt.compare(password, user_found.password)
        if(!check){
            res.json({error:{msg:"Password doesn't match"}})
        }
        const payload = {
            user:{
                id: user_found.id
            }
        }
        jwt.sign(
            payload,
            config.get("JWTSecret"),
            {
                expiresIn: 3600000
            },(err,token) =>{
                if(err){throw err}
                res.json({token})
        }
        )
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

module.exports = router