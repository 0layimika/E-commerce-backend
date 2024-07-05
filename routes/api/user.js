const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const {check, validationResult } = require('express-validator');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../../middleware/auth");
//Register a new User
router.post('/',[
    check('email',"Please enter a valid email address").isEmail(),
    check('password', 'password cannot be less than 8 characters and cannot be more that 12 characters').isLength({min:8,max:12}),
    check('name','Please input your name').not().isEmpty()
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({errors: error.array()});
    }
    let {name, email, password} = req.body;
    try{
        const search_user = await User.findOne({ email });
        if(search_user){
            return res.status(400).json({errors:[{msg:"Email already exists in system"}]})
        }
        const user = new User({
            name, email,password
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user:{
                id: user.id,
            }
        }
        jwt.sign(
            payload,
            config.get("JWTSecret"),
            {
                expiresIn: 3600000,
            },
            (err, token) => {
                if(err){throw err}
                res.json({token})
            }
        )
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})



//Update User password
router.put('/password',[auth,
    check('password', 'password cannot be less than 8 characters and cannot be more that 12 characters').isLength({min:8,max:12}),
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({errors: error.array()});
    }
    let {password, old_password} = req.body;
    try{
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(400).json({errors:[{msg:"Such User doesn't exist"}]})
        }
        const test = await bcrypt.compare(old_password, user.password);
        if(!test){
            return res.status(400).json({errors:[{msg:"Password doesn't match"}]})
        }
        user.password = password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        return res.status(200).send("Password successfully updated")
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

module.exports = router