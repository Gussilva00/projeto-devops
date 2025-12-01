// backend/app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// helper: ler e escrever arquivo JSON simples
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { items: [], nextId: 1 };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// garante arquivo inicial
if (!fs.existsSync(DATA_FILE)) {
  writeData({ items: [], nextId: 1 });
}

/**
 * Rotas:
 * GET  /items        -> lista todos
 * GET  /items/:id    -> pega 1
 * POST /items        -> cria { title, description }
 * PUT  /items/:id    -> atualiza campos
 * DELETE /items/:id  -> remove
 */

// GET /items
app.get('/items', (req, res) => {
  const data = readData();
  res.json(data.items);
});

// GET /items/:id
app.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const item = data.items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST /items
app.post('/items', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const data = readData();
  const newItem = { id: data.nextId++, title, description: description || '' };
  data.items.push(newItem);
  writeData(data);
  res.status(201).json(newItem);
});

// PUT /items/:id
app.put('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;
  const data = readData();
  const idx = data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (title !== undefined) data.items[idx].title = title;
  if (description !== undefined) data.items[idx].description = description;
  writeData(data);
  res.json(data.items[idx]);
});

// DELETE /items/:id
app.delete('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const data = readData();
  const idx = data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = data.items.splice(idx, 1)[0];
  writeData(data);
  res.json(removed);
});

// rota de status (útil p/ Zabbix e health checks)
app.get('/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
