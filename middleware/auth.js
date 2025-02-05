const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function(req, res, next) {
    const token = req.headers['x-auth-token']
    if (!token) {
        return res.status(401).json({ error: 'No token provided' })
    }
    try{
        const decoded = jwt.verify(token, config.get('JWTSecret'));
        req.user = decoded.user
        next()
    }catch(err){
        console.error(err.message)
        res.status(401).json({ error: 'Invalid token' })
    }
}