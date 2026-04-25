const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sql = neon(process.env.DATABASE_URL);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // 🟢 CADASTRO
  if (req.method === "POST" && pathname.endsWith("/cadastro")) {
    const { nome, email, senha } = req.body;
    try {
      const senhaHash = await bcrypt.hash(senha, 10);
      const result = await sql`
        INSERT INTO usuarios (nome, email, senha)
        VALUES (${nome}, ${email}, ${senhaHash})
        RETURNING id, nome, email
      `;
      return res.status(201).json(result[0]);
    } catch (err) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }
  }

  // 🔵 LOGIN
  if (req.method === "POST" && pathname.endsWith("/login")) {
    const { email, senha } = req.body;
    try {
      const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
      if (result.length === 0) return res.status(401).json({ erro: "Email ou senha inválidos." });

      const usuario = result[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) return res.status(401).json({ erro: "Email ou senha inválidos." });

      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
    } catch (err) {
      return res.status(500).json({ erro: "Erro interno." });
    }
  }
};