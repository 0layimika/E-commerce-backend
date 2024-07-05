const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const upload = require('../../middleware/cloudinary')
const admin = require("../../middleware/admin")
const auth = require("../../middleware/auth")
const {check, validationResult } = require('express-validator')

const categories = ['shirts', 'shorts', 'jackets', 'accessories', 'hoodies']
const productValidator = [
    check("name", "please enter name of product").not().isEmpty(),
    check("description", "please enter description of product").not().isEmpty(),
    check("price", "please enter price of product as number").isNumeric().not().isEmpty(),
    check('category', 'Possible categories are: shirts, shorts, jackets, accessories, hoodies')
    .notEmpty()
    .custom(value => {
      if (!categories.includes(value.toLowerCase())) {
        throw new Error('Invalid category');
      }
      return true;
    }),
    check("quantity","please enter available stock in number").isNumeric().not().isEmpty()
]
const updateValidator = [
    check("name", "please enter name of product").optional().not().isEmpty(),
    check("description", "please enter description of product").optional().not().isEmpty(),
    check("price", "please enter price of product as number").optional().isNumeric().not().isEmpty(),
    check('category', 'Possible categories are: shirts, shorts, jackets, accessories, hoodies').optional().notEmpty()
    .custom(value => {
      if (!categories.includes(value.toLowerCase())) {
        throw new Error('Invalid category');
      }
      return true;
    }),
    check("quantity","please enter available stock in number").optional().isNumeric().not().isEmpty()
]
const validateImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      errors: [
        {
          msg: 'Please upload image of product',
          param: 'image',
          location: 'body'
        }
      ]
    });
  }
  next();
}

//Admin add product to db
router.post('/', [admin,
    upload.single('image'),
    productValidator,
    validateImage
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({errors: error.array()});
    }
    const {name, description, price, quantity} = req.body;
    let category = req.body.category;
    category = category.toLowerCase();
    const image = req.file ? req.file.path : ''
    try{
        const product = await new Product({name,
        description,
        price,
        category,
        quantity,
        image});

    product.save()
    res.json(product)
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }

})


//Admin delete a product
router.delete('/:id', [admin], async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({error:{"msg":"Product not found"}});
        }
        await product.deleteOne()
        res.status(200).send("Product deleted")
    }catch(err){
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Product not found"})
        }
        res.status(500).send("Server Error")
    }
})

//Admin Update product detail
router.put('/:id', [admin,upload.single('image'),
    updateValidator], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({errors: error.array()});
    }
    const {name, description, price, quantity} = req.body;
    let category = req.body.category
    if (category){
        category = category.toLowerCase();
    }
    const image = req.file ? req.file.path : ''

    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({error:{"msg":"Product not found"}});
        }
        product.name = name || product.name
        product.description = description || product.description
        product.price = price || product.price
        product.category = category || product.category
        product.quantity = quantity || product.quantity
        product.image = image|| product.image
        await product.save()
        res.json(product)
    }catch(err){
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Product not found"})
        }
        res.status(500).send("Server Error")
    }

})

//Get all products
router.get("/", async (req, res) => {
    try{
        const products = await Product.find()
        return res.status(200).json(products)
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

//Get products by category
router.get("/:category", async (req, res) => {
    try{
        const target_category = req.params.category.toLowerCase()
        const products = await Product.find({category:target_category})
        return res.status(200).json(products)
    }catch(err){
        console.error(err.message)
        res.status(500).send("Server Error")
    }
})

//Get specific product by id
router.get("/specific/:id", async (req, res) => {
    try{
        product = await Product.findById(req.params.id);
        if(!product){
            res.status(404).json({error:{"msg":"Product not found"}});
        }
        return res.status(200).json(product)
    }catch(err){
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Product not found"})
        }
        res.status(500).send("Server Error")
    }
})
module.exports = router;