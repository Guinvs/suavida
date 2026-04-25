import { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    try {
      if (cadastro) {
        await api.post("/usuarios/cadastro", { nome, email, senha });
        setCadastro(false);
        setErro("Cadastro realizado! Faça login.");
      } else {
        const res = await api.post("/usuarios/login", { email, senha });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        onLogin(res.data.usuario);
      }
    } catch (err) {
      setErro("Email ou senha inválidos.");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>{cadastro ? "Cadastro" : "Login"} — SuaVida</h2>

      {erro && <p style={{ color: cadastro ? "green" : "red" }}>{erro}</p>}

      <form onSubmit={handleSubmit}>
        {cadastro && (
          <div>
            <label>Nome</label>
            <input value={nome} onChange={e => setNome(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 12 }} />
          </div>
        )}
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        </div>
        <div>
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6 }}>
          {cadastro ? "Cadastrar" : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: 12, textAlign: "center", cursor: "pointer", color: "#4f46e5" }}
        onClick={() => setCadastro(!cadastro)}>
        {cadastro ? "Já tenho conta" : "Criar conta"}
      </p>
    </div>
  );
}