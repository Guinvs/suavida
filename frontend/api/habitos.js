const { neon } = require("@neondatabase/serverless");
const jwt = require("jsonwebtoken");

const sql = neon(process.env.DATABASE_URL);

function verificarToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Token não fornecido.");
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  let usuario;
  try {
    usuario = verificarToken(req);
  } catch {
    return res.status(401).json({ erro: "Token inválido." });
  }

  // 🔵 LISTAR
  if (req.method === "GET") {
    const result = await sql`
      SELECT * FROM habitos WHERE usuario_id = ${usuario.id} AND ativo = true ORDER BY id ASC
    `;
    return res.json(result);
  }

  // 🟢 CRIAR
  if (req.method === "POST") {
    const { nome } = req.body;
    const result = await sql`
      INSERT INTO habitos (usuario_id, nome) VALUES (${usuario.id}, ${nome}) RETURNING *
    `;
    return res.status(201).json(result[0]);
  }

  // 🔴 DELETAR
  if (req.method === "DELETE") {
    const id = req.url.split("/").pop();
    await sql`UPDATE habitos SET ativo = false WHERE id = ${id} AND usuario_id = ${usuario.id}`;
    return res.json({ success: true });
  }
};