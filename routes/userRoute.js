const express = require("express");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const {signToken} = require("../Authentication/Auth"); 
const asyncWrap = require("../utils/asyncWrap");
const router = express.Router();


router.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})


router.get("/login",(req,res)=>{
    res.render("login.ejs");
})

router.get("/logout",(req,res)=>{
    res.clearCookie("token");
    req.flash("success", "Logged out successfully. See you again!");
    return res.redirect("/blog");
})


router.post("/signup",asyncWrap(async (req,res)=>{
    const {username, email, password} = req.body;
    if(!username?.trim() || !email?.trim() || !password?.trim()){
        req.flash("error","All fields required");
        return res.redirect("/user/signup");
    }

    const userExist = await User.findOne({email});
    if(userExist){
        req.flash("error", "Email already registered");
        return res.redirect("/user/signup");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    await User.create({
        username,
        email,
        password : hashedPassword,
    })
    req.flash("success", "User Registered Successfully");
    res.redirect("/user/login");
}))


router.post("/login",asyncWrap(async (req,res)=>{
    const {email, password} = req.body;
    
    if(!email?.trim() || !password?.trim()){
        req.flash("error","All fields required");
        return res.redirect("/user/login");
    }

    const user = await User.findOne({email});
    if(!user){
        req.flash("error", "User does not exist");
        return res.redirect("/user/login");
    }
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        req.flash("error", "Wrong email or password");
        return res.redirect("/user/login");
    }

    // Verify Token
    const token = signToken(user);
    res.cookie("token",token,{ 
        httpOnly: true, // सुरक्षा के लिए, ताकि क्लाइंट-साइड JS इसे न पढ़ सके
        maxAge: 3600000 // 1 घंटा (milliseconds में)
    });
    
    req.flash("success", `Welcome back, ${user.username}!`);
    res.redirect("/blog");
}))

module.exports = router;