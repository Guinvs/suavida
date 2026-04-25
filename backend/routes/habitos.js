const express = require("express");
const router = express.Router();
const sql = require("../db");
const auth = require("../middleware/auth");

// 🔵 LISTAR hábitos
router.get("/", auth, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM habitos 
      WHERE usuario_id = ${req.usuario.id} AND ativo = true
      ORDER BY id ASC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar hábitos." });
  }
});

// 🟢 CRIAR hábito
router.post("/", auth, async (req, res) => {
  const { nome } = req.body;
  try {
    const result = await sql`
      INSERT INTO habitos (usuario_id, nome)
      VALUES (${req.usuario.id}, ${nome})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar hábito." });
  }
});

// 🔴 DELETAR hábito
router.delete("/:id", auth, async (req, res) => {
  try {
    await sql`
      UPDATE habitos SET ativo = false
      WHERE id = ${req.params.id} AND usuario_id = ${req.usuario.id}
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar hábito." });
  }
});

module.exports = router;