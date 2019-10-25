const mongoose = require('mongoose')

const contentSchema = new mongoose.Schema({
    url: String,
    description: String,
});

const Content = mongoose.model('Content', contentSchema)



module.exports = Content;