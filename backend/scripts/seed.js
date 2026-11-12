
require("dotenv").config();

const pool = require("../config/database");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create demo user
    const name = "Sweety Demo";
    const email = "demo@sweety.com";
    const password = "Sweety@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, email, hashedPassword]
    );

    const userId = userResult.rows[0].id;

    // Sample glucose readings
    const sampleReadings = [
      [0, "Morning fasting", 105],
      [0, "After breakfast", 145],
      [0, "After lunch", 132],
      [0, "After dinner", 128],

      [1, "Morning fasting", 110],
      [1, "After breakfast", 150],
      [1, "After lunch", 138],
      [1, "After dinner", 130],

      [2, "Morning fasting", 102],
      [2, "After breakfast", 142],
      [2, "After lunch", 135],

      [3, "Morning fasting", 108],
      [3, "After breakfast", 148],

      [4, "Morning fasting", 100]
    ];

    for (const [daysAgo, slot, value] of sampleReadings) {
      await client.query(
        `INSERT INTO readings
          (user_id, reading_date, slot, value)
         VALUES
          ($1, CURRENT_DATE - $2::integer, $3, $4)
         ON CONFLICT (user_id, reading_date, slot)
         DO NOTHING`,
        [userId, daysAgo, slot, value]
      );
    }

    await client.query("COMMIT");

    console.log("================================");
    console.log("Sweety demo data created!");
    console.log("Email: demo@sweety.com");
    console.log("Password: Sweety@123");
    console.log("================================");

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
