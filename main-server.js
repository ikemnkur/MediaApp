// Main server code (server.js)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || '34.174.158.123',
  user: process.env.DB_USER || 'remote',
  password: process.env.DB_PASSWORD || 'Password!*',
  database: process.env.DB_NAME || 'imgsearchdb'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

const lastRequestTimestamps = {};

// Middleware to check request rate
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (lastRequestTimestamps[ip] && now - lastRequestTimestamps[ip] < 3000) {
    return res.status(429).send('Too many requests. Please wait a few seconds before trying again.');
  }

  lastRequestTimestamps[ip] = now;
  next();
};

// WebSocket handling
wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
    const { type, id } = data;

    switch (type) {
      case 'fetchThumbnails':
        db.query('SELECT * FROM thumbnails', (err, results) => {
          if (err) throw err;
          ws.send(JSON.stringify({ type: 'thumbnails', data: results }));
        });
        break;
      case 'fetchImage':
        db.query('SELECT * FROM images WHERE id = ?', [id], (err, results) => {
          if (err) throw err;
          ws.send(JSON.stringify({ type: 'image', data: results[0] }));
        });
        break;
      case 'fetchVideo':
        db.query('SELECT * FROM videos WHERE id = ?', [id], (err, results) => {
          if (err) throw err;
          ws.send(JSON.stringify({ type: 'video', data: results[0] }));
        });
        break;
      case 'updateViews':
        db.query('UPDATE images SET views = views + 1 WHERE id = ?', [id], (err, result) => {
          if (err) throw err;
        });
        break;
      case 'updateLikes':
        db.query('UPDATE images SET likes = likes + 1 WHERE id = ?', [id], (err, result) => {
          if (err) throw err;
        });
        break;
      case 'updateDislikes':
        db.query('UPDATE images SET dislikes = dislikes + 1 WHERE id = ?', [id], (err, result) => {
          if (err) throw err;
        });
        break;
      default:
        console.log(`Unknown message type: ${type}`);
    }
  });

  ws.send('Connection established with main server');
});

// Convert timestamp to MySQL format
const convertTimestampToMySQL = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// Upload image and thumbnail
app.post('/upload', (req, res) => {
  const { name, nickname, tags, url, timestamp, thumbnailUrl } = req.body;
  const tagsStr = tags.join(',');

  const formattedTimestamp = convertTimestampToMySQL(timestamp);

  const sqlImage = 'INSERT INTO images (url, name, tags, timestamp, nickname, tag) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sqlImage, [url, name, JSON.stringify(tagsStr.split(",")), formattedTimestamp, nickname, tagsStr], (err, result) => {
    if (err) {
      console.error('Error inserting image:', err);
      return res.status(500).send('Error inserting image');
    }
    const imageId = result.insertId;

    const sqlThumbnail = 'INSERT INTO thumbnails (url, name, tags, timestamp, nickname) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlThumbnail, [thumbnailUrl, name, JSON.stringify(tagsStr.split(",")), formattedTimestamp, nickname], (err, result) => {
      if (err) {
        console.error('Error inserting thumbnail:', err);
        return res.status(500).send('Error inserting thumbnail');
      }
      res.json({ imageId });
    });
  });
});

// Get comments by image ID
app.get('/comments', (req, res) => {
  const { imageId } = req.query;
  const sql = 'SELECT * FROM comments WHERE imageId = ?';
  db.query(sql, [imageId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Post comment
app.post('/comments', (req, res) => {
  const { imageId, nickname, comment } = req.body;
  const timestamp = new Date().toISOString(); // Ensure timestamp is in ISO 8601 format
  const sql = 'INSERT INTO comments (imageId, nickname, comment, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [imageId, nickname, comment, timestamp], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
