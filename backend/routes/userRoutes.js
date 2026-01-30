const userModel = require('../models/user.js');
const express = require('express');
const userRoutes = express.Router();
const {query} = require('express-validator')

userRoutes.post('/user/signup', async (req, res) => {
    const content = req.body;
    try {
        const user = new userModel({
            username: content.username,
            email: content.email,
            password: content.password,
            created_at: content.created_at,
            updated_at: content.updated_at
        });
        const data = await user.save();
        res.status(201).send({
            message: "User created successfully",
            user: data
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating the user."
        });
    }
});

userRoutes.post('/user/login',query('password').notEmpty(),async(req,res)=>{
    try {
        const user = await userModel.findOne({username: req.body.username}).select('+password');
        if (!user) {
            return res.status(404).send({
                message: "User not found " + req.body.username
            });
        }
        
        const isMatch = await user.isValidPassword(req.body.password);
        if (!isMatch) {
        throw new Error('Invalid password');
        }else{
            res.status(200).send({
                message: "Login successful"
            });
        }
        
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.body._id
            });
        }
        res.status(500).send({
            message: "Invalid Password"
        });
    }
});

module.exports = userRoutes;