const mongoose = require('mongoose');

const classifiedSchema = new mongoose.Schema({
    classified_type:{
        type: String,
        required:[true,"No type specified"]
    },
    name:{
        type: String,
        required:[true,"No name listed"]
    },
    description:{
        type: String,
        required: [true,"No description given"]
    },
    date_posted:{
        type: Date,
        default: Date.now
    }
})

classifiedSchema.pre('save', function(next) {
    this.date_posted = Date.now();
});

module.exports = mongoose.model('Classified', classifiedSchema);