import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, front, back } = req.body;

  if (!id) return res.status(400).json({ error: "Missing card id" });

  try {
    const result = await pool.query(
      "UPDATE cards SET front = $1, back = $2 WHERE id = $3 RETURNING *",
      [front, back, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}