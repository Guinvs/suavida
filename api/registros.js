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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
      SELECT * FROM registros WHERE usuario_id = ${usuario.id} ORDER BY data DESC
    `;
    return res.json(result);
  }

  // 🟢 CRIAR ou ATUALIZAR
  if (req.method === "POST") {
    const { data, estudos, habitos, humor, energia, notas } = req.body;

    const existe = await sql`
      SELECT id FROM registros WHERE usuario_id = ${usuario.id} AND data = ${data}
    `;

    let result;
    if (existe.length > 0) {
      result = await sql`
        UPDATE registros
        SET estudos = ${estudos}, habitos = ${JSON.stringify(habitos)},
            humor = ${humor}, energia = ${energia}, notas = ${notas}
        WHERE usuario_id = ${usuario.id} AND data = ${data}
        RETURNING *
      `;
    } else {
      result = await sql`
        INSERT INTO registros (usuario_id, data, estudos, habitos, humor, energia, notas)
        VALUES (${usuario.id}, ${data}, ${estudos}, ${JSON.stringify(habitos)}, ${humor}, ${energia}, ${notas})
        RETURNING *
      `;
    }

    return res.status(201).json(result[0]);
  }
};