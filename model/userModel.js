const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: { type: String },
    username: { type: String },
    email: { type: String },
    password: { type: String },
    devices: [{ type: mongoose.Schema.Types.Mixed }]
}, { timeStamps: true });
const UserModel = mongoose.model('AuthUser', userSchema);
module.exports = UserModel;