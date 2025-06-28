import express from "express";
import { sql } from "../config/db.js";
import { getTransactionsByUserId, deleteTransactions, getSummaryByUserId, createTransactions } from "../controller/transactionsController.js";

const router = express.Router();

// To get the details from DB 
router.get("/:userId", getTransactionsByUserId);

// To delete the details from DB 
router.delete("/:id", deleteTransactions);

//To fetch App Summary 
router.get("/summary/:userId", getSummaryByUserId);
  

//To Create Transactions in the Database
router.post("/", createTransactions);

export default router;
