const userModel = require('../models/user.js');
const express = require('express');
const userRoutes = express.Router();
const {query} = require('express-validator')

userRoutes.post('/user/signup', async (req, res) => {
    const content = req.body;
    try {
        const user = new userModel({
            username: content.username,
            first_name:content.first_name,
            last_name: content.last_name,
            email: content.email,
            password: content.password,
            user_type: content.user_type,
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

userRoutes.get('/user/users', async (req, res) => {
    try {
        const user = await userModel.find();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving users."
        });
    }
});

userRoutes.put('/user/:id', async (req, res) => {
    const content = req.body;
    try {
        if (!content.updated_at) {
            content.updated_at = Date.now();
        }
        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            content,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });
        }
        res.status(200).send({
            message: "User updated successfully",
            employee: employee
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });
        }
        res.status(500).send({
            message: "Error updating user with id " + req.params.id
        });
    }
});

userRoutes.delete('/user/:id', async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });
        }
        res.status(204).send({
            message: "User deleted successfully!",
            user: user
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });
        }
        res.status(500).send({
            message: "Could not delete user with id " + req.params.id
        });
    }
});


module.exports = userRoutes;