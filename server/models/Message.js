const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    mobile: String,
    subject: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
