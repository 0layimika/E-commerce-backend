const mongoose = require('mongoose');
const {models} = require("mongoose");

const CartSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    products:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity:{
            type:Number,
            default: 1
        }
    }]
})

module.exports = Cart = mongoose.model("cart", CartSchema);