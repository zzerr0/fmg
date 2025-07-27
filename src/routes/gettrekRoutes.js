import express from "express";
import { sql } from "../config/db.js";
import { getFilteredTreks} from "../controller/transactionsController.js";

const router = express.Router();


router.get("/filter", getFilteredTreks);


export default router;
