const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const multer = require("multer");
const config = require("config")

cloudinary.config({
    cloud_name: config.get("CLOUD_NAME"),
    api_key: config.get("C_API_KEY"),
    api_secret: config.get("C_SECRET_KEY")
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:'E-commerce',
        allowed_formats:['jpg','jpeg','png','gif']
    }
})

const upload = multer({storage: storage})

module.exports = upload