const path = require('path')
const prismaFile = path.resolve(__dirname, '..', 'config', 'prisma.js')
const prisma = require(prismaFile)
const bcrypt = require('bcrypt')
const { users } = require('../config/prisma')
const jwt = require('jsonwebtoken')
const { error } = require('console')

exports.login = async(req, res) => {
    try{
     const {email, password} = req.body;
     const user = await prisma.users.findUnique({where : {email}})
     if(!user){
        console.error('error find email', error)
        return res.status(404).json({error: "email tidak ditemukan"});
     }

     const passwordValid = await bcrypt.compare(password, user.password);
     if(!passwordValid){
        console.error('wrong password')
       return res.status(401).json({error: "pass salah!"})
     }

     const token = jwt.sign(
        {id: user.id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '1d'}
     )

    return res.status(201).json({
        message: "Login Successfully!",
        token
     })

    }catch(error){
        console.error(error)
        res.status(500).json({error: "email or password are required!"})
    }
}