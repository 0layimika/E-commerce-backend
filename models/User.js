const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    admin:{
        type:Boolean,
        default:false
    }
})
module.exports = User = mongoose.model("user", UserSchema)