const express = require('express');
const app = express()
const port = process.env.PORT || 3001;
const DB = require("./config/db")
const user = require("./routes/api/user")
const auth = require("./routes/api/auth")
const product = require("./routes/api/product")
const admin = require("./routes/api/admin")
const cart = require("./routes/api/cart")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

DB()
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

app.get("/", (req, res) => {
    res.send("Api running")
})


app.use("/api/user", user)
app.use("/api/auth", auth)
app.use("/api/product",product)
app.use("/api/admin", admin)
app.use("/api/cart", cart)