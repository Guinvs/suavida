require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
const usuariosRoutes = require("./routes/usuarios");
const habitosRoutes = require("./routes/habitos");
const registrosRoutes = require("./routes/registros");

app.use("/usuarios", usuariosRoutes);
app.use("/habitos", habitosRoutes);
app.use("/registros", registrosRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SuaVida API rodando 🚀" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});