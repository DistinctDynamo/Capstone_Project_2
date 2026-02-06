const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    team_name:{
        type: String,
        required:[true,"No team name given"],
        trim: true
    },
    date_of_creation:{
        type: Date,
        default: Date.now
    },
    date_updated:{
        type: Date,
        default: Date.now
    }
    //Do To: add image field for team logo
})

teamSchema.pre('save', function(next) {
    this.date_of_creation = Date.now();
});

module.exports = mongoose.model('Team', teamSchema);