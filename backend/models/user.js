const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
       type: String,
       required: [true, 'Username is required'],
       trim: true
    },
    first_name:{
        type: String,
        required:[true, "No first name"],
        trim: true
    },
    last_name:{
        type: String,
        required:[true, "No last name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        select: false
    },
    user_type: {
        type: String,
        required: [true, 'User type is required']
    }, 
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at:{
        type: Date,
        default: Date.now
    },
    games_played:{
        type: Number
    },
    goals: {
        type: Number
    },
    assists:{
        type: Number
    },
    team_role:{
        type: String
    },
    on_team:{
        type:Boolean
    }
    //To Do: Add a field for image upload
})

userSchema.pre('save', async function(next) {
  try {
    this.updated_at = Date.now();

    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
     
  } catch (error) {
    next(error); 
  }
});

userSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

module.exports = mongoose.model('User', userSchema);