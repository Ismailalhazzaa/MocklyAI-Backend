const express = require("express") ; 
const cors = require('cors');
require("./config/databaseConnection");
const mongoose = require('mongoose');
require('dotenv').config() ;

const PORT = process.env.PORT || 4000 ; 

const server =  express();


// Define CORS options
const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};
server.use(express.json());
server.use(cors(corsOptions));
server.use(express.urlencoded({ extended: true }));




server.use((error,req,res,next)=>{
    res.status(error.statusCode || 500).json({status:false ,message:error.message,errors:error.errors , data: null})
});

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});