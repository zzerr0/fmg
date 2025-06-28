import {neon} from "@neondatabase/serverless";
import "dotenv/config";

//To make sql connection to use our DB URL and write sql queries
export const sql = neon(process.env.DATABASE_URL); 


//To initialize DB
export async function initDB() {
    try {
        //Creats table if it does not exists
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY, 
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amouNt DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`

        console.log("DB Initialised sucessfully");
    } catch (error) {
        console.log("DB Initialised Failure", error);
        process.exit(1);
    }
}
