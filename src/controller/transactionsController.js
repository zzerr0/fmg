import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
        try {
            const {userId} = req.params;
            const transactions = await sql `
            SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
            `
            res.status(200).json(transactions);
        } catch(error) {
            console.log("Error In Getting Transactions : ", error);
            res.status(500).json({message:" Internal server errorr"});
        }
}

export async function  createTransactions(req,res) {
    //send title, amount, etc to DB
    try {
        const {title, user_id, amount, category } = req.body;
        if (!title || !user_id || amount === undefined || !category) {
            // One or more required fields are missing
            return res.status(400).json({message : "All fields are required"});
          }
        
        const transactions = await sql `
            INSERT INTO transactions(user_id, title, amount, category)
            VALUES (${user_id},${title},${amount},${category})
            RETURNING *
        `
        console.log(transactions);
        res.status(201).json(transactions[0]);
    } catch(error) {
        console.log("Error In Creating Transactions : ", error);
        res.status(500).json({message:" Internal server error"});
    }
    
}

export async function deleteTransactions(req,res) {
    try {
        const {id} = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ message: "Invalid transaction ID" });
        }
 
        const result = await sql `
        DELETE FROM transactions WHERE id = ${id} RETURNING *
        `
        console.log("My Result " , result);
        if(result.length === 0){
            return res.status(404).json({message:"No Record found with Such Id"});
        }

        return res.status(200).json({message:"Deleted Successfully"});

    } catch (error) {
        console.log("Error In Deleting Transactions : ", error);
        res.status(500).json({message:" Internal server error"});
    }
}

export async function getSummaryByUserId(req, res) {
    try {
      const { userId } = req.params;
  
      const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance 
        FROM transactions 
        WHERE user_id = ${userId}
      `
        const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income 
        FROM transactions 
        WHERE user_id = ${userId} AND amount > 0
        `

        const expensesResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS expenses 
        FROM transactions 
        WHERE user_id = ${userId} AND amount < 0
        `
  
        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].expenses
        });
  
    } catch (error) {
      console.log("Error getting the summary", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }