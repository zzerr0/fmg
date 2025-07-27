// src/config/db.js

import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Initialize SQL client
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // 1. Transactions Table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id          SERIAL       PRIMARY KEY,
        user_id     VARCHAR(255) NOT NULL,
        title       VARCHAR(255) NOT NULL,
        amount      DECIMAL(10,2) NOT NULL,
        category    VARCHAR(255) NOT NULL,
        created_at  DATE         NOT NULL DEFAULT CURRENT_DATE
      );
    `;

    // 2. User Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS userprofileinfo (
        id                 SERIAL       PRIMARY KEY,
        user_id            VARCHAR(255) NOT NULL,
        name               VARCHAR(255) NOT NULL,
        email              VARCHAR(255) NOT NULL,
        phone              VARCHAR(20),

        sports             TEXT[]       NOT NULL DEFAULT '{}',
        sports_other       VARCHAR(255),
        experience         TEXT[]       NOT NULL DEFAULT '{}',
        experience_other   VARCHAR(255),
        preferences        TEXT[]       NOT NULL DEFAULT '{}',
        preferences_other  VARCHAR(255),
        health             TEXT[]       NOT NULL DEFAULT '{}',
        health_other       VARCHAR(255),

        bmi                VARCHAR(255) NOT NULL,
        bmi_other          VARCHAR(255),
        ageGroup           VARCHAR(255) NOT NULL,
        ageGroup_other     VARCHAR(255),
        bloodGroup         VARCHAR(255) NOT NULL,
        bloodGroup_other   VARCHAR(255),

        created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `;

    // 3. Treks Table
    await sql`
      CREATE TABLE IF NOT EXISTS treks (
        trek_id               SERIAL        PRIMARY KEY,
        name                  VARCHAR(255)  NOT NULL,
        description           TEXT          NOT NULL,
        location              VARCHAR(255)  NOT NULL,
        difficulty            VARCHAR(50)   NOT NULL,
        duration_value        INTEGER       NOT NULL,
        duration_unit         VARCHAR(10)   NOT NULL,
        price_per_person      DECIMAL(8,2)  NOT NULL,
        currency              CHAR(3)       NOT NULL DEFAULT 'USD',
        deposit_amount        DECIMAL(8,2),
        cancellation_policy   TEXT,

        -- 🔽 Added for UI filtering
        route_type            VARCHAR(50),
        attractions           TEXT[]        DEFAULT ARRAY[]::TEXT[],
        popularity            INTEGER       DEFAULT 0,
        season_priority       INTEGER       DEFAULT 0,

        created_by_profile_id INTEGER       NOT NULL
          REFERENCES userprofileinfo(id) ON DELETE RESTRICT,

        created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMP     NOT NULL DEFAULT NOW()
      );
    `;

    // 4. Trek Gear Table
    await sql`
      CREATE TABLE IF NOT EXISTS trek_gear (
        trek_gear_id      SERIAL       PRIMARY KEY,
        trek_id           INTEGER      NOT NULL
          REFERENCES treks(trek_id) ON DELETE CASCADE,
        gear_name         VARCHAR(255) NOT NULL,
        required_quantity INTEGER      NOT NULL DEFAULT 1,
        can_rent          BOOLEAN      NOT NULL DEFAULT FALSE,
        rent_rate_per_day DECIMAL(8,2),
        purchase_price    DECIMAL(8,2),
        purchase_link     VARCHAR(1024),
        created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `;

    // 5. Bookings Table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id       SERIAL       PRIMARY KEY,
        trek_id          INTEGER      NOT NULL
          REFERENCES treks(trek_id) ON DELETE CASCADE,
        user_profile_id  INTEGER      NOT NULL
          REFERENCES userprofileinfo(id) ON DELETE CASCADE,
        start_date       DATE         NOT NULL,
        end_date         DATE         NOT NULL,
        total_gear_rent  DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_price      DECIMAL(10,2) NOT NULL,
        status           VARCHAR(50)  NOT NULL DEFAULT 'requested',
        created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `;

    console.log(" DB initialized successfully");
  } catch (error) {
    console.error(" DB initialization failure:", error);
    process.exit(1);
  }
}
