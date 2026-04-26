const express = require("express");
const router = express.Router();
const sql = require("../db");
const auth = require("../middleware/auth");

// 🔵 LISTAR registros
router.get("/", auth, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM registros
      WHERE usuario_id = ${req.usuario.id}
      ORDER BY data DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar registros." });
  }
});

// 🔵 BUSCAR registro por data
router.get("/:data", auth, async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM registros
      WHERE usuario_id = ${req.usuario.id} AND data = ${req.params.data}
    `;
    res.json(result[0] || null);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar registro." });
  }
});

// 🟢 CRIAR ou ATUALIZAR registro do dia
router.post("/", auth, async (req, res) => {
  const { data, estudos, habitos, humor, energia, notas } = req.body;

  try {
    // Verifica se já existe registro para o dia
    const existe = await sql`
      SELECT id FROM registros
      WHERE usuario_id = ${req.usuario.id} AND data = ${data}
    `;

    let result;

    if (existe.length > 0) {
      // Atualiza
      result = await sql`
        UPDATE registros
        SET estudos = ${estudos}, habitos = ${JSON.stringify(habitos)},
            humor = ${humor}, energia = ${energia}, notas = ${notas}
        WHERE usuario_id = ${req.usuario.id} AND data = ${data}
        RETURNING *
      `;
    } else {
      // Cria
      result = await sql`
        INSERT INTO registros (usuario_id, data, estudos, habitos, humor, energia, notas)
        VALUES (${req.usuario.id}, ${data}, ${estudos}, ${JSON.stringify(habitos)}, ${humor}, ${energia}, ${notas})
        RETURNING *
      `;
    }

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao salvar registro." });
  }
});

// 🔴 DELETAR registro
router.delete("/:id", auth, async (req, res) => {
  try {
    await sql`
      DELETE FROM registros 
      WHERE id = ${req.params.id} AND usuario_id = ${req.usuario.id}
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao deletar registro." });
  }
});

module.exports = router;
