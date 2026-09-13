const { pool } = require("../config/db");

// GET /api/notices  (any logged-in user)
async function getNotices(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT n.id, n.title, n.content, n.published_at, u.name AS created_by_name
       FROM notices n JOIN users u ON u.id = n.created_by
       ORDER BY n.published_at DESC`
    );
    res.json({ notices: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load notices.", error: error.message });
  }
}

// POST /api/notices  (admin, teacher)
async function createNotice(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required." });
    }

    const [result] = await pool.execute(
      "INSERT INTO notices (title, content, created_by) VALUES (?, ?, ?)",
      [title, content, req.user.id]
    );

    res.status(201).json({ message: "Notice published.", noticeId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create notice.", error: error.message });
  }
}

// PUT /api/notices/:id  (admin, teacher)
async function updateNotice(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    await pool.execute(
      "UPDATE notices SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?",
      [title || null, content || null, id]
    );

    res.json({ message: "Notice updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update notice.", error: error.message });
  }
}

// DELETE /api/notices/:id  (admin, teacher)
async function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM notices WHERE id = ?", [id]);
    res.json({ message: "Notice removed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete notice.", error: error.message });
  }
}

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
