const express = require("express");
const { verifyToken } = require("../Authentication/Auth");
const Blog = require("../models/blog");
const Review = require("../models/reviews");
const asyncWrap = require("../utils/asyncWrap");

const { cloudinary, storage } = require("../config/cloudinary"); // cloudnary
const multer = require("multer");
const upload = multer({ storage });

const router = express.Router();

router.get(
  "/",
  asyncWrap(async (req, res) => {
    const blogs = await Blog.find();
    res.render("home.ejs", {
      blogs,
    });
  }),
);

router.get("/new", verifyToken, (req, res) => {
  res.render("blog.ejs");
});

// Particular Post Route

router.get(
  "/:id",
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findOne({ _id: id }).populate("owner");

    if (!blog) {
      req.flash("error", "Blog not found!");
      return res.redirect("/blog");
    }
    const reviews = await Review.find({ blog: id }).populate("author");
    res.render("blogSinglePage", {
      blog,
      reviews,
    });
  }),
);

// Show edit form
router.get(
  "/:id/edit",
  verifyToken,
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findOne({ _id: id });
    if (!blog) {
      req.flash("error", "Blog not found");
      return res.redirect("/blog");
    }

    if (!blog.owner.equals(req.user.id)) {
      req.flash("error", "You are not allowed to Edit this post");
      return res.redirect(`/blog/${req.params.id}`);
    }

    res.render("editBlog.ejs", {
      blog,
      currentUser: req.user || null,
    });
  }),
);

// post create Route

router.post(
  "/new",
  verifyToken,
  upload.single("image"),
  asyncWrap(async (req, res) => {
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
      req.flash("error", "Title and Content are required");
      return res.redirect("/blog/new");
    }

    const blog = await Blog.create({
      image: {
        url: req.file.path,
        filename: req.file.filename,
      },
      title,
      description: content,
      owner: req.user.id,
    });
    req.flash("success", "Post created SuccessFully");
    res.redirect("/blog");
  }),
);

// Delete Route
router.delete(
  "/:id",
  verifyToken,
  asyncWrap(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).send("Blog post not found");
    }

    // 🔒 ONLY OWNER CAN DELETE
    if (!blog.owner.equals(req.user.id)) {
      req.flash("error", "You are not allowed to delete this post");
      return res.redirect(`/blog/${req.params.id}`);
    }

    // Cloudinary se image delete
    await cloudinary.uploader.destroy(blog.image.filename);

    // MongoDB se blog delete
    await Blog.findByIdAndDelete(id);

    // Reviews delete
    await Review.deleteMany({ blog: id });
    req.flash("success", "Post Delete Successfully");
    res.redirect("/blog");
  }),
);

// Edit Route
router.put(
  "/:id",
  verifyToken,
  upload.single("image"),
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const blog = await Blog.findOne({ _id: id });

    if (!blog) {
      return res.status(404).send("Blog post not found");
    }

    // 🔒 ONLY OWNER CAN DELETE
    if (!blog.owner.equals(req.user.id)) {
      req.flash("error", "You are not allowed to edit this post");
      return res.redirect(`/blog/${req.params.id}`);
    }

    if (!title?.trim() || !content?.trim()) {
      req.flash("error", "Title and Content are required");
      return res.redirect("back");
    }

    // if new image uploaded
    if (req.file) {
      await cloudinary.uploader.destroy(blog.image.filename);

      blog.image.url = req.file.path;
      blog.image.filename = req.file.filename;
    }

    blog.title = title;
    blog.description = content;

    await blog.save();
    req.flash("success", "Blog Updated SuccessFully");
    res.redirect(`/blog/${id}`);
  }),
);

// review create router
router.post(
  "/:id/reviews",
  verifyToken,
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      req.flash("error", "Comment cannot be empty");
      return res.redirect(`/blog/${id}`);
    }
    const review = await Review.create({
      content,
      author: req.user.id,
      blog: id,
    });
    // console.log(review);
    req.flash("success", "Review Added");
    res.redirect(`/blog/${id}`);
  }),
);

// review delete Router
router.delete(
  "/:blogId/reviews/:reviewId",
  verifyToken,
  asyncWrap(async (req, res) => {
    const { blogId, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user.id)) {
      req.flash("error", "Unauthorized");
      return res.redirect(`/blog/${blogId}`);
    }

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Comment deleted");
    res.redirect(`/blog/${blogId}`);
  }),
);

module.exports = router;
