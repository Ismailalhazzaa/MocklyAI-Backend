const express = require("express") ; 
const cors = require('cors');
require("./config/databaseConnection");
const mongoose = require('mongoose');
const userRoutes = require("./routes/user.routes");
const sessionRoutes = require("./routes/session.routes");
const questionRoutes = require("./routes/question.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
require('dotenv').config() ;

const PORT = process.env.PORT || 4000 ; 

const server =  express();


// Define CORS options
const corsOptions = {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};
server.use(express.json());
server.use(cors(corsOptions));
server.use(express.urlencoded({ extended: true }));

server.use("/api/users", userRoutes);
server.use("/api/sessions", sessionRoutes);
server.use("/api/questions", questionRoutes);
server.use("/api/dashboard", dashboardRoutes);

server.use((error,req,res,next)=>{
    res.status(error.statusCode || 500).json({status:false ,message:error.message,errors:error.errors , data: null})
});

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});