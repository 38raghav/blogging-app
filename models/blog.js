const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  image: {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },  
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Blog = new mongoose.model("Blog", blogSchema);
module.exports = Blog;
