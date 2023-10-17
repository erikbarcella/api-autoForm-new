let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose"); 

let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: {type: String, unique: true, required: true},
    isAdmin: {type: Boolean, default: false},
    isApproved: { type: Boolean, default: false },
    // lastActive: { type: Date, default: Date.now }, // Data da última atividade
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
