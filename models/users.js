const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content'
    }]
});

const User = mongoose.model('User', userSchema)



module.exports = User;