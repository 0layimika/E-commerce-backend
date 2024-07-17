const express = require('express');
const router = express.Router();
const Product = require('../../models/Product')
const Cart = require('../../models/Cart')
const User = require('../../models/User')
const auth = require('../../middleware/auth');
const {check, validationResult } = require('express-validator');

//add to cart
router.post('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: { msg: "User not found" } });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: { msg: "Product not found" } });
    }

    if (product.quantity <= 0) {
      return res.status(409).json({ error: { msg: "Product Out of Stock" } });
    }

    let cart = await Cart.findOne({ user: user.id });
    if (!cart) {
      cart = new Cart({
        user: user.id,
        products: [{ product: product.id, quantity: 1 }]
      });
    } else {
      const productIndex = cart.products.findIndex(p => p.product.toString() === product.id.toString());
      if (productIndex > -1) {
        if(cart.products[productIndex].quantity >= product.quantity){
          return res.status(409).json({ error: { msg: "Product Out of Stock" } })
        }
        cart.products[productIndex].quantity += 1;
      } else {
        cart.products.push({ product: product.id, quantity: 1 });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Product not found"})
        }
    res.status(500).send("Server Error");
  }
})

//Update Cart Quantity
router.put('/:prod_id', [auth,
  check('quantity', 'please put a valid quantity').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const cart = await Cart.findOne({user:req.user.id});
    if (!cart) {
      return res.status(404).json({ error: { msg: "Cart does not exist" } });
    }

    if (cart.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const product = await Product.findById(req.params.prod_id);
    if (!product) {
      return res.status(404).json({ error: { msg: "Product does not exist" } });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === product.id.toString());
    if (productIndex === -1) {
      return res.status(404).json({ error: { msg: "Product does not exist in cart" } });
    }

    const { quantity } = req.body;

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
      await cart.save();
      return res.json(cart);
    }

    if (quantity > product.quantity) {
      return res.status(409).json({ error: { msg: `There are only ${product.quantity} left` } });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();
    res.json(cart);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "Cart not found" });
    }
    res.status(500).send("Server Error");
  }
});

//Remove product from cart
router.delete('/:id',[auth],async(req,res)=>{
  try{
    const cart = await Cart.findOne({user:req.user.id})
    if(!cart){
      return res.status(404).json({ error: { msg: "Cart not found" } });
    }
    const product = await Product.findById(req.params.id);
    if(!product){
      return res.status(404).json({error:{msg:"product does not exist"}})
    }
    const productIndex = await cart.products.findIndex(p => p.product.toString() === product.id.toString());
    if(productIndex === -1) {
      return res.status(404).json({ error: { msg: "Product does not exist in cart" } });
    }
    await cart.products[productIndex].deleteOne()
    await cart.save()
    res.json(cart)
  }catch(err){
    console.error(err.message)
    if(err.kind === 'ObjectId'){
      return res.status(404).json({msg: "Product not found here"})
    }
    res.status(500).send("Server Error!!!!!!!")
  }
})

//Clear Cart
router.delete('/',[auth], async(req,res)=>{
  try{
    const cart = await Cart.findOne({user:req.user.id})
    if (!cart){
      return res.status(404).json({ error: { msg: "Cart not found" } });
    }
    if(cart.products.length === 0){
      return res.status(404).send("Cart is Empty")
    }
    cart.products = []
    await cart.save()
    res.json({msg:"Cart has been cleared", cart})
  }catch(err){
    console.error(err.message)
    res.status(500).send("Server Error!!!!!!!!!!!!!")
  }
})
//Get cart details
router.get('/',[auth], async(req,res)=>{
  try{
    const cart = await Cart.findOne({user:req.user.id}).populate('products.product')
    if(!cart){
      return res.status(404).json({ error: { msg: "Your cart is empty(not yet initiated)" } });
    }
    if(cart.products.length === 0){
      return res.send("Cart is empty")
    }
    let total_price= 0
    for (let item of cart.products) {
        if (item.product && item.product.price) {
            total_price += item.product.price * item.quantity;
        }
    }
    res.status(200).json({cart, "total price": total_price});
  }catch(err){
    console.error(err.message)
    return res.status(400).send("Server Error !!!!")
  }
})

module.exports = router