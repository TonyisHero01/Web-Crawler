const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pageSchema = new Schema({
    url: String,
    title: String,
    time: Date
});

module.exports = mongoose.model('Page', pageSchema);