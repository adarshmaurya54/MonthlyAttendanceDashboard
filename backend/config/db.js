const mongoose = require('mongoose');
require("dotenv").config();

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to Mongodb Database ${mongoose.connection.host}`);
        
    }catch(err){
        console.log(`Mongodb Database Error ${err}`);
        
    }
}

module.exports = connectDB;