import pkg from "pg";
const { Pool } = pkg;

// Use DATABASE_URL from Vercel environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, side, value } = req.body;

  if (!id || !side || value === undefined) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Only allow front or back
  if (!["front", "back"].includes(side)) {
    return res.status(400).json({ error: "Invalid side" });
  }

  try {
    const result = await pool.query(
      `UPDATE cards SET ${side} = $1 WHERE id = $2 RETURNING *`,
      [value, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}