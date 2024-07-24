const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const ejs = require('ejs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket handling
wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`);
  });

  ws.send('Connection established with client server');
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/search-results', (req, res) => {
  const searchTerm = req.query.search || '';
  res.render('search_results', { searchTerm });
});

app.get('/image-viewer', (req, res) => {
  const id = req.query.id || '';
  res.render('image_viewer', { id });
});

app.get('/video-viewer', (req, res) => {
  const id = req.query.id || '';
  res.render('video_viewer', { id });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

server.listen(3000, () => {
  console.log('Client server running on port 3000');
});
