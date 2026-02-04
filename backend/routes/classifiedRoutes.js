const classifiedModel = require('../models/classified.js')
const express = require('express');
const classifiedRoutes = express.Router();

classifiedRoutes.post('/classified/post', async (req, res) => {
    const content = req.body;
    try {
        const classified = new classifiedModel({
            classified_type: content.classified_type,
            name: content.name,
            description: content.description,
            created_at: content.created_at,
            updated_at: content.updated_at,
            location: content.location
        });
        const data = await classified.save();
        res.status(201).send({
            message: "Classified created successfully",
            classified: data
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while creating the classified."
        });
    }
});

classifiedRoutes.get('/classified/classifieds', async (req, res) => {
    try {
        const classified = await classifiedModel.find();
        res.status(200).send(classified);
    } catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving classifieds."
        });
    }
});

classifiedRoutes.put('/classified/:id', async (req, res) => {
    const content = req.body;
    try {
        if (!content.updated_at) {
            content.updated_at = Date.now();
        }
        const classified = await classifiedModel.findByIdAndUpdate(
            req.params.id,
            content,
            { new: true, runValidators: true }
        );
        res.status(200).send({
            message: "Classified updated successfully",
            classified: classified
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Classified not found with id " + req.params.id
            });
        }
        res.status(500).send({
            message: "Error updating classified with id " + req.params.id
        });
    }
});

userRoutes.delete('/classified/:id', async (req, res) => {
    try {
        const classified = await classifiedModel.findByIdAndDelete(req.params.id);
        if (!classified) {
            return res.status(404).send({
                message: "Classified not found with id " + req.params.id
            });
        }
        res.status(204).send({
            message: "Classified deleted successfully!",
            classified: classified
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Classified not found with id " + req.params.id
            });
        }
        res.status(500).send({
            message: "Could not delete classified with id " + req.params.id
        });
    }
});