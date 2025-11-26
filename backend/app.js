const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Vamos guardar dados apenas na memória
let items = [];
let idCounter = 1;

app.get('/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/data', (req, res) => {
  res.json(items);
});

app.post('/data', (req, res) => {
  const payload = req.body;
  const entry = { id: idCounter++, ...payload };
  items.push(entry);
  res.status(201).json(entry);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
