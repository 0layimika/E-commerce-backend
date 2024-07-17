const mongoose = require('mongoose');
const {models} = mongoose;

const OrderSchema = new mongoose.Schema({
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
    }],
    name:{
        type:String,
        required:true,
    },
    address:{
        "street": String,
        "city": String,
        "state": String,
        "country": String
    },
    email:{
        type:String,
        required:true,
    },
    telephone:{
        type:String,
        required:true,
    },
    additional:{
        type:String,
    },
    total_price:{
        type:Number,
        required:true,
    }
})

module.exports = Order = mongoose.model("order", OrderSchema);