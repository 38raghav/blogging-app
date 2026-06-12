require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const userRoute = require("./routes/userRoute");
const blogRoute = require("./routes/blogRoute");
const connectDB = require("./mongoConnection");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const {softCheckToken } = require("./Authentication/Auth");
const methodOverride = require('method-override');



connectDB();

// Basic EJS Configuration
app.set('view engine','ejs');  // let Express know you are using EJS files
app.set('views',path.join(__dirname,'views'));  // By default, Express looks in a folder named /views.


// Middleware with EJS
// app.use(express.static('public')); // Serves CSS, JS, and images
app.use(express.urlencoded({ extended: true })); // Parses form data for EJS templates



// 3. Initialize cookie-parser middleware (CRUCIAL STEP)
app.use(cookieParser());


// 1. Session Configuration
app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false
}))

app.use(methodOverride('_method'));

// 2. Flash Initialize
app.use(flash());

app.use(softCheckToken);
// Middleware
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error =  req.flash("error");
    next();
})



app.use("/user",userRoute);
app.use("/blog",blogRoute);


app.use((err,req,res,next)=>{
    console.error(err);
    req.flash("error", err.message || "Something went wrong");
    res.redirect("/blog");
})


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

