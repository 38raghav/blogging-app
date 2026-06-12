const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET;

function signToken(user) {
  const token = jwt.sign(
    {
      id: user._id,
      name: user.username,
      email: user.email,
    },
    secretKey,
    { expiresIn: "1h" }
  );

  return token;
}


// strict check

function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    req.flash("error", "Please login first to access this page");
    return res.redirect("/user/login");
  }
  
  try {

    const decode = jwt.verify(token, secretKey);
    req.user = decode;
    res.locals.user = decode;
    next();

  } catch (err) {
    req.flash("error", "Session expired. Please login again.");
    return res.redirect("/user/login");
  }
}



// softCheck

function softCheckToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    res.locals.user = null;
    return next();
  }
  
  try {

    const decode = jwt.verify(token, secretKey);
    req.user = decode;
    res.locals.user = decode;

  } catch (err) {
    req.user = null;
    res.locals.user = null;
    
  }
  next();
}


module.exports = { signToken, verifyToken ,softCheckToken };
