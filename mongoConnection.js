const mongoose = require("mongoose");

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");
    }
    catch(error){
        console.log("MongoDB connection Failed",error.message);

    }
}


module.exports =  connectDB;