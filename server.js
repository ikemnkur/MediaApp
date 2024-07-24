const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Serve the static files
app.use(express.static(path.join(__dirname, 'public')));

// Get image by ID
app.get('/images/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM images WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// Update view count
app.patch('/images/:id/views', (req, res) => {
  const { id } = req.params;
  const sql = 'UPDATE images SET views = views + 1 WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Update likes or dislikes
app.patch('/images/:id/:action', (req, res) => {
  const { id, action } = req.params;
  if (action !== 'likes' && action !== 'dislikes') {
    return res.status(400).send('Invalid action');
  }
  const sql = `UPDATE images SET ${action} = ${action} + 1 WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

// Upload image
app.post('/upload', (req, res) => {
  const { name, nickname, tags, url, timestamp, thumbnailUrl } = req.body;
  const tagsStr = tags.join(',');

  const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');

  const sqlImage = 'INSERT INTO images (url, name, tags, timestamp, nickname) VALUES (?, ?, ?, ?, ?)';
  db.query(sqlImage, [url, name, JSON.stringify(tagsStr.split(",")), formattedTimestamp, nickname], (err, result) => {
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
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' '); // Ensure timestamp is in ISO 8601 format
  const sql = 'INSERT INTO comments (imageId, nickname, comment, timestamp) VALUES (?, ?, ?, ?)';
  db.query(sql, [imageId, nickname, comment, timestamp], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Get random thumbnails
app.get('/random-thumbnails', (req, res) => {
    const sql = 'SELECT * FROM thumbnails ORDER BY RAND() LIMIT 3';
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // Get random media
  app.get('/random-media', (req, res) => {
    const sql = 'SELECT id FROM images ORDER BY RAND() LIMIT 1';
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results[0]);
    });
  });
  