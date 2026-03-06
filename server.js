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

  if(!user_id) return false;
  if(!token) return false;

  const TOKEN_MASTER = "ZAPFOOD_PLUGIN_2026";

  if(token !== TOKEN_MASTER) return false;

  return true;

}

/* =============================
   STATUS API
============================= */

app.get("/", (req, res) => {

  res.json({
    status: "API ZapFood Brasil online"
  });

});

/* =============================
   REGISTRO PLUGIN
============================= */

app.post("/plugin/register", (req, res) => {

  const { user_id, machine_id, plugin_version, token } = req.body;

  if (!tokenValido(user_id, token)) {

    return res.status(401).json({
      error: "Plugin não autorizado"
    });

  }

  if (!plugins[user_id]) {
    plugins[user_id] = [];
  }

  const existe = plugins[user_id].find(
    p => p.machine_id === machine_id
  );

  if (!existe) {

    plugins[user_id].push({
      machine_id,
      plugin_version,
      last_seen: new Date()
    });

  }

  console.log("Plugin conectado:", user_id, machine_id);

  res.json({
    status: "plugin registrado"
  });

});

/* =============================
   FILA DE PEDIDOS
============================= */

app.post("/plugin/print", (req, res) => {

  const { user_id, tipo, pdf } = req.body;

  filaPedidos.push({
    user_id,
    tipo,
    pdf
  });

  console.log("Pedido enviado para fila");

  res.json({
    status: "pedido enviado"
  });

});

/* =============================
   BUSCAR PEDIDOS
============================= */

app.get("/plugin/pedidos", (req, res) => {

  const { user_id } = req.query;

  const pedidos = filaPedidos.filter(
    p => p.user_id === user_id
  );

  filaPedidos = filaPedidos.filter(
    p => p.user_id !== user_id
  );

  res.json(pedidos);

});

/* =============================
   STATUS PLUGINS
============================= */

app.get("/plugin/status", (req, res) => {

  res.json(plugins);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("API ZapFood Brasil rodando na porta", PORT);

});