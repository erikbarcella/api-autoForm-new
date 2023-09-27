let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose"); 

let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: {type: String, unique: true, required: true},
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
