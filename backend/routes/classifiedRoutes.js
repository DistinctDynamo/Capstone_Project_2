const express = require("express");
const mongoose = require("mongoose");
const Classified = require("../models/classified");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post("/", async (req, res) => {
    try {
        const created = await Classified.create(req.body);
        return res.status(201).json({
            message: "Classified created",
            data: created,
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: err.errors,
            });
        }
        return res.status(500).json({
            message: "Server Error",
            error: err.message
        })
    }
});