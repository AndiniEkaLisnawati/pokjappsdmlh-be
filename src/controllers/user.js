const express = require('express');
const prisma = require('../config/prisma');
const router = express.Router();
const bcrypt = require('bcrypt') 

exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createUser = async(req, res) => {
    try{
        const {fullname, email, password} = req.body;
        if(!fullname || !email || !password){
            return res.status(400).json({error: "fullname, email, and password are required"})
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.users.create({
            data: {fullname, email, password: hashedPassword}
        })
           const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);

    } catch(error) {
        console.error(error);
        res.status(500).json({error : "failed to create user"})
    }
}