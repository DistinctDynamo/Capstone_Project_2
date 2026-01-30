const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title not given"]
    },
    date_posted:{
        type:Date,
        default: Date.now
    },
    description:{
        type: String,
        required: [true,"No description given"]
    },
    location:{
        type:String,
        required: [true,"No location listed"]
    },
    interest:{
        type: Float32Array
    },
    price:{
        //Not required 0 represents a free event
        type:Number
    }
})

eventSchema.pre('save', function(next) {
    this.date_posted = Date.now();
});

module.exports = mongoose.model('Event', eventSchema);