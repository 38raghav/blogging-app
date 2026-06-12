const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        minlength : 3,
    },
    email : {
        type : String,
        unique : true,
        required : true,
        lowercase : true,
        minlength : 6,
        match: /^\S+@\S+\.\S+$/,
    },
    password : {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

const User = new mongoose.model("User",userSchema);

module.exports = User;