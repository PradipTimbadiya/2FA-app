const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    enable2fa:{
        type: Boolean,
        default: false
    },
    secret2fa:{
        type: String
    }
});

User.pre('save',async function(next){
    return this.password = await bcrypt.hash(this.password,10);
    next();
})

const UserModel = mongoose.model('user' , User);

module.exports =UserModel;