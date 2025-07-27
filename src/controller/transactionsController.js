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
        console.log("req body is ------- ");
        if (!title || !user_id || amount === undefined || !category) {
            // One or more required fields are missing
            return res.status(400).json({message : "All fffields are required"});
          }
        
        const transactions = await sql `
            INSERT INTO transactions(user_id, title, amount, category)
            VALUES (${user_id},${title},${amount},${category})
            RETURNING *
        `
        console.log(transactions);
        res.status(201).json(transactions[0]);
    } catch(error) {
        console.log("Error In Creating Transaction : ", error);
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

export async function getUserProfileInfo(req, res) {
    console.log('Inside get User Profile');
    try {
      const { userId } = req.params;
  
      // 1) Fetch the profile row (if any)
      const [profile] = await sql`
        SELECT 
          id,
          user_id,
          name,
          email,
          phone,
          sports,
          sports_other,
          experience,
          experience_other,
          preferences,
          preferences_other,
          health,
          health_other,
          bmi,
          bmi_other,
          ageGroup,
          ageGroup_other,
          bloodGroup,
          bloodGroup_other,
          created_at
        FROM userprofileinfo
        WHERE user_id = ${userId}
      `;
  
    //   // 2) Fetch all transactions for that user
    //   const transactions = await sql`
    //     SELECT 
    //       id,
    //       user_id,
    //       title,
    //       amount,
    //       category,
    //       created_at
    //     FROM transactions
    //     WHERE user_id = ${userId}
    //     ORDER BY created_at DESC
    //   `;
  
      // 3) Return both in one JSON payload
      return res.status(200).json({
        profile:      profile || null
      });
    } catch (error) {
      console.error("Error in getUserProfileInfo:", error);
      return res
        .status(500)
        .json({ message: "Internal server error" });
    }
}

// controllers/profileController.js
export async function updateProfileData(req, res) {
  try {
    // 1) Pull userId from the URL, other fields from the body
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      sports,
      sports_other,
      experience,
      experience_other,
      preferences,
      preferences_other,
      health,
      health_other,
      bmi,
      bmi_other,
      ageGroup,
      ageGroup_other,
      bloodGroup,
      bloodGroup_other,
    } = req.body;

    console.log('updateProfileData body:', { userId, ...req.body });

    // 2) Basic validation: require at least these core fields
    if (!userId || !name?.trim() || !email?.trim() || !ageGroup || !bloodGroup) {
      return res
        .status(400)
        .json({
          message:
            'Missing required fields: userId, name, email, ageGroup, bloodGroup',
        });
    }

    // 3) Perform the UPDATE
    const [updated] = await sql`
      UPDATE userprofileinfo
      SET
        name            = ${name},
        email           = ${email},
        phone           = ${phone},
        sports          = ${sports},
        sports_other    = ${sports_other},
        experience      = ${experience},
        experience_other= ${experience_other},
        preferences     = ${preferences},
        preferences_other= ${preferences_other},
        health          = ${health},
        health_other    = ${health_other},
        bmi             = ${bmi},
        bmi_other       = ${bmi_other},
        agegroup        = ${ageGroup},
        agegroup_other  = ${ageGroup_other},
        bloodgroup      = ${bloodGroup},
        bloodgroup_other= ${bloodGroup_other}
      WHERE user_id = ${userId}
      RETURNING *;
    `;

    if (!updated) {
      // no row matched that user_id
      return res
        .status(404)
        .json({ message: `No profile found for user_id=${userId}` });
    }

    console.log('Updated profile:', updated);
    return res.status(200).json(updated);

  } catch (error) {
    console.error('Error in updateProfileData:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error updating profile' });
  }
}


//Fetching Treks
export async function getFilteredTreks(req, res) {
  try {
    const { keyword, routeTypes, attractions, sort } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const conditions = [sql`LOWER(name) LIKE LOWER(${`%${keyword}%`})`];

    // Handle routeTypes
    if (routeTypes) {
      const routeList = routeTypes.split(",").map((r) => r.trim());
      if (routeList.length > 0) {
        conditions.push(sql`route_type = ANY (${sql.array(routeList, 'text')})`);
      }
    }

    // Handle attractions
    if (attractions) {
      const attractionList = attractions.split(",").map((a) => a.trim());
      if (attractionList.length > 0) {
        conditions.push(sql`attractions && ${sql.array(attractionList, 'text')}`);
      }
    }

    // Determine ORDER BY clause
    let orderClause = sql`ORDER BY created_at DESC`; // default
    if (sort === "Most Popular") {
      orderClause = sql`ORDER BY popularity DESC`;
    } else if (sort === "Closest") {
      orderClause = sql`ORDER BY location ASC`; // Replace if you have lat/lng
    } else if (sort === "Seasonal") {
      orderClause = sql`ORDER BY season_priority DESC`;
    } else if (sort === "Newly Added") {
      orderClause = sql`ORDER BY created_at DESC`;
    }

    // Final query with dynamic WHERE clauses
    const treks = await sql`
      SELECT *
      FROM treks
      WHERE ${sql.join(conditions, sql` AND `)}
      ${orderClause}
    `;

    res.status(200).json({ treks });

  } catch (error) {
    console.error("Error fetching treks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}