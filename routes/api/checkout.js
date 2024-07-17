const express = require('express')
const router = express.Router()
const {check, validationResult } = require('express-validator')
const User = require("../../models/User");
const Checkout = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const auth = require("../../middleware/auth");

//Checkout form!!
router.post('/', [auth,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'please enter a valid email address').isEmail(),
    check('telephone', 'please enter a valid telephone number').not().isEmpty(),
    check('street', 'Please enter a street').not().isEmpty(),
    check('city', 'Please enter a city').not().isEmpty(),
    check('state', 'Please enter a state').not().isEmpty(),
    check('country', 'Please enter a country').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const cart = await Cart.findOne({user:req.user.id}).populate('products.product');
    if (!cart || cart.products.length === 0) {
      return res.status(404).json({ error: { msg: "Cart is unavailable" } });
    }
    let total_price = 0;
    for (let item of cart.products) {
        if (item.product && item.product.price) {
            total_price += item.product.price * item.quantity;
        }
    }

    const {name, email, telephone, street, city, state, country, additional} = req.body;
    const address = {}
    address.street = street
    address.city = city
    address.state = state
    address.country = country

    const order = new Checkout({user: req.user.id,products:cart.products,
        name, email, telephone, address, additional, total_price})

    await order.save()
    return res.json(order)

})


module.exports = router