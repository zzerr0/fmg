//const express = require("express")
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import rateLimiter from "./middleware/rateLimiter.js";
import { initDB } from "./config/db.js";
import transactionsRoutes from "./routes/transactionsRoutes.js";
import getprofileRoutes from "./routes/getprofileRoutes.js";
import gettrekRoutes from "./routes/gettrekRoutes.js";



//create an express app
const app = express();

//middleware
app.use(rateLimiter);
app.use(express.json());
const PORT = process.env.PORT || 5001;


console.log("My Current Port : ", process.env.PORT );

app.use("/api/transactions", transactionsRoutes);
app.use("/api/getprofile", getprofileRoutes);
app.use("/api/gettreks", gettrekRoutes);


initDB().then( () => {
    //start listening on a port and once we stop listening and Print Server is Up and Running
    app.listen(PORT, () => {
    console.log("Server is up and Running on PORT : ", PORT);
    });
})