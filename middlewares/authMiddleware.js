const jwt = require('jsonwebtoken')
require('dotenv').config()

const authMiddlware = (req, res, next) => {
    try
    {
        const authHeader = req.headers.authorization
    
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: 'Token manquant ou invalide'})
        }
    
        const token = authHeader.split(' ')[1]
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" })
    }
}

module.exports = authMiddlware