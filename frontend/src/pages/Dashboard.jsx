import { useState, useEffect } from "react";
import api from "../services/api";

export default function Dashboard({ usuario, onLogout }) {
  const [registros, setRegistros] = useState([]);
  const [habitos, setHabitos] = useState([]);
  const [novoHabito, setNovoHabito] = useState("");
  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    estudos: "",
    humor: 3,
    energia: 3,
    notas: "",
    habitos: []
  });
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resRegistros, resHabitos] = await Promise.all([
      api.get("/registros"),
      api.get("/habitos")
    ]);
    setRegistros(resRegistros.data);
    setHabitos(resHabitos.data);
  }

  async function salvarRegistro(e) {
    e.preventDefault();
    try {
      await api.post("/registros", form);
      setMensagem("✅ Registro salvo com sucesso!");
      carregarDados();
      setTimeout(() => setMensagem(""), 3000);
    } catch (err) {
      setMensagem("❌ Erro ao salvar registro.");
    }
  }

  async function adicionarHabito() {
    if (!novoHabito.trim()) return;
    await api.post("/habitos", { nome: novoHabito });
    setNovoHabito("");
    carregarDados();
  }

  async function removerHabito(id) {
    await api.delete(`/habitos/${id}`);
    carregarDados();
  }

  function toggleHabito(nome) {
    setForm(prev => ({
      ...prev,
      habitos: prev.habitos.includes(nome)
        ? prev.habitos.filter(h => h !== nome)
        : [...prev.habitos, nome]
    }));
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    onLogout();
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>👋 Olá, {usuario.nome}!</h1>
        <button onClick={logout} style={{ padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6 }}>
          Sair
        </button>
      </div>

      {/* Formulário de registro diário */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h2>📝 Registro do dia</h2>

        <form onSubmit={salvarRegistro}>
          <div style={{ marginBottom: 12 }}>
            <label>Data</label>
            <input type="date" value={form.data}
              onChange={e => setForm({ ...form, data: e.target.value })}
              style={{ width: "100%", padding: 8 }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>O que você estudou hoje?</label>
            <textarea value={form.estudos}
              onChange={e => setForm({ ...form, estudos: e.target.value })}
              style={{ width: "100%", padding: 8, height: 80 }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Humor (1-5): {form.humor}</label>
            <input type="range" min="1" max="5" value={form.humor}
              onChange={e => setForm({ ...form, humor: Number(e.target.value) })}
              style={{ width: "100%" }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Energia (1-5): {form.energia}</label>
            <input type="range" min="1" max="5" value={form.energia}
              onChange={e => setForm({ ...form, energia: Number(e.target.value) })}
              style={{ width: "100%" }} />
          </div>

          {/* Hábitos */}
          <div style={{ marginBottom: 12 }}>
            <label>Hábitos cumpridos hoje:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {habitos.map(h => (
                <button type="button" key={h.id}
                  onClick={() => toggleHabito(h.nome)}
                  style={{
                    padding: "6px 12px", borderRadius: 20, border: "1px solid #4f46e5",
                    background: form.habitos.includes(h.nome) ? "#4f46e5" : "#fff",
                    color: form.habitos.includes(h.nome) ? "#fff" : "#4f46e5",
                    cursor: "pointer"
                  }}>
                  {h.nome}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Notas</label>
            <textarea value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              style={{ width: "100%", padding: 8, height: 80 }} />
          </div>

          {mensagem && <p>{mensagem}</p>}

          <button type="submit" style={{ width: "100%", padding: 10, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6 }}>
            Salvar registro
          </button>
        </form>
      </div>

      {/* Gerenciar hábitos */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <h2>🎯 Meus hábitos</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={novoHabito} onChange={e => setNovoHabito(e.target.value)}
            placeholder="Novo hábito..." style={{ flex: 1, padding: 8 }} />
          <button onClick={adicionarHabito}
            style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6 }}>
            Adicionar
          </button>
        </div>
        {habitos.map(h => (
          <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <span>{h.nome}</span>
            <button onClick={() => removerHabito(h.id)}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 24 }}>
        <h2>📅 Histórico</h2>
        {registros.length === 0 && <p>Nenhum registro ainda.</p>}
        {registros.map(r => (
          <div key={r.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
            <strong>{new Date(r.data).toLocaleDateString("pt-BR")}</strong>
            <p>😊 Humor: {r.humor} | ⚡ Energia: {r.energia}</p>
            {r.estudos && <p>📚 {r.estudos}</p>}
            {r.notas && <p>📝 {r.notas}</p>}
          </div>
        ))}
      </div>

    </div>
  );
}