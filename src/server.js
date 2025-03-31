const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const sendToAsana = require("./services/asana");
require('dotenv').config();

const app = express();

app.use(fileUpload());
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
app.use(express.json());

app.get('/', (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Access-Control-Allow-Origin", "*"); 
});

app.get("/teste", async (req, res) => {
  res.json({
    mensagem: "Requisição GET recebida com sucesso!",
    status: "ok",
    data: new Date().toISOString(),
  });
});


app.post("/asana", async (req, res) => {
  try {
      const formData = req.body;
      if (req.files && req.files.anexo) {
        formData.anexo = Array.isArray(req.files.anexo) ? req.files.anexo : [req.files.anexo];
      }
      console.log("Dados recebidos no servidor:", formData);
  
      const resultado = await sendToAsana(formData);
      res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar tarefa no Asana." });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
