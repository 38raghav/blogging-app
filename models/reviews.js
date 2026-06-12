const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    content : {
        type : String,
        required : true,
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true 
    },
    blog : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Blog",
        required : true 
    }
},{ timestamps: true })

const Review = new mongoose.model("Review",reviewSchema);
module.exports = Review;