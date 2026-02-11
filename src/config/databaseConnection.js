const mongoose = require("mongoose");
require("dotenv").config();
const DBConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("mongoDB server started successfuly");
    } catch(error) {
        console.log(error.message);
        // process.exit(1); this cpmmand use to exit from the server if the connection is not success
    }
};

DBConnect();