const mongoose = require('mongoose');

const passKeySchema = mongoose.Schema({
    id: { type: String, required: true },
    publicKey: { type: String },
    userId: { type: String },
    webauthnUserID: { type: String },
    counter: { type: Number },
    deviceType: { type: String },
    backedUp: { type: Boolean },
    devices: [{ type: String }]
}, { timeStamps: true });

const PassKeyModel = mongoose.model('AuthPassKey', passKeySchema);
module.exports = PassKeyModel;