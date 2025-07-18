import express from "express";
import { sql } from "../config/db.js";
import { updateProfileData, getUserProfileInfo} from "../controller/transactionsController.js";

const router = express.Router();

// // To get the details from DB 
// router.get("/:userId", getTransactionsByUserId);

// To get UserProfileInfo details from DB 
router.get("/getprofileData/:userId", getUserProfileInfo);
console.log('Inside router file');
router.put("/updateProfileData/:userId", updateProfileData);

// // To delete the details from DB 
// router.delete("/:id", deleteTransactions);

// //To fetch App Summary 
// router.get("/summary/:userId", getSummaryByUserId);
  

// //To Create Transactions in the Database
// router.post("/", createTransactions);

export default router;
