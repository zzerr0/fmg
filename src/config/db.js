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
        )`;

        await sql`
        CREATE TABLE IF NOT EXISTS userprofileinfo (
        id                 SERIAL PRIMARY KEY,
        user_id            VARCHAR(255)  NOT NULL,
        name               VARCHAR(255)  NOT NULL,
        email              VARCHAR(255)  NOT NULL,
        phone              VARCHAR(20),

        sports             TEXT[] DEFAULT '{}' NOT NULL,
        sports_other       VARCHAR(255),
        experience         TEXT[] DEFAULT '{}' NOT NULL,
        experience_other   VARCHAR(255),
        preferences        TEXT[] DEFAULT '{}' NOT NULL,
        preferences_other  VARCHAR(255),
        health             TEXT[] DEFAULT '{}' NOT NULL,
        health_other       VARCHAR(255),

        bmi                VARCHAR(255)  NOT NULL,
        bmi_other          VARCHAR(255),
        ageGroup           VARCHAR(255)  NOT NULL,
        ageGroup_other     VARCHAR(255),
        bloodGroup         VARCHAR(255)  NOT NULL,
        bloodGroup_other   VARCHAR(255),

        created_at         DATE DEFAULT CURRENT_DATE NOT NULL
        )
        `;

        console.log(" DB Initialised sucessfully");
    } catch (error) {
        console.log("DB Initialised Failure", error);
        process.exit(1);
    }
}
