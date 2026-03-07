const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let plugins = {};
let filaPedidos = [];

/* =============================
   VALIDAÇÃO DE TOKEN
============================= */
function tokenValido(user_id, token) {
  if (!user_id || !token) return false;
  const TOKEN_MASTER = "ZAPFOOD_PLUGIN_2026";
  return token === TOKEN_MASTER;
}

/* =============================
   STATUS API
============================= */
app.get("/", (req, res) => {
  res.json({ status: "API ZapFood Brasil online" });
});

/* =============================
   HEALTH CHECK (Railway)
============================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =============================
   REGISTRO PLUGIN
============================= */
app.post("/plugin/register", (req, res) => {
  try {
    const { user_id, machine_id, plugin_version, token } = req.body;
    if (!tokenValido(user_id, token)) {
      return res.status(401).json({ error: "Plugin não autorizado" });
    }

    if (!plugins[user_id]) plugins[user_id] = [];
    const existe = plugins[user_id].find(p => p.machine_id === machine_id);
    if (!existe) {
      plugins[user_id].push({ machine_id, plugin_version, last_seen: new Date() });
    }

    console.log("Plugin conectado:", user_id, machine_id);
    res.json({ status: "plugin registrado" });

  } catch (error) {
    console.error("Erro register:", error);
    res.status(500).json({ error: "erro interno" });
  }
});

/* =============================
   FILA DE PEDIDOS
============================= */
app.post("/plugin/print", (req, res) => {
  try {
    const { user_id, tipo, pdf } = req.body;
    filaPedidos.push({ user_id, tipo, pdf });
    console.log("Pedido enviado para fila");
    res.json({ status: "pedido enviado" });

  } catch (error) {
    console.error("Erro print:", error);
    res.status(500).json({ error: "erro interno" });
  }
});

/* =============================
   BUSCAR PEDIDOS
============================= */
app.get("/plugin/pedidos", (req, res) => {
  try {
    const { user_id } = req.query;
    const pedidos = filaPedidos.filter(p => p.user_id === user_id);
    filaPedidos = filaPedidos.filter(p => p.user_id !== user_id);
    res.json(pedidos);

  } catch (error) {
    console.error("Erro pedidos:", error);
    res.status(500).json({ error: "erro interno" });
  }
});

/* =============================
   STATUS PLUGINS
============================= */
app.get("/plugin/status", (req, res) => {
  res.json(plugins);
});

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("API ZapFood Brasil iniciada");
  console.log("Porta:", PORT);
  console.log("=================================");
});