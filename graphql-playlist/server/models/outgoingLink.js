const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const outgoingLinkSchema = new Schema({
    from_id: String,
    url: String,
});

module.exports = mongoose.model('Outgoing_link', outgoingLinkSchema);