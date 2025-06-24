const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookstore'
});

// Signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err) => {
      if (err) return res.status(500).send('Error');
      res.sendStatus(201);
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err || results.length === 0) return res.status(401).send('Invalid');
      res.json({ userId: results[0].id }); // Send back user ID
    }
  );
});

// Get Books with Filter
app.get('/books', (req, res) => {
  let sql = 'SELECT * FROM books WHERE 1=1';
  const values = [];

  if (req.query.author) {
    sql += ' AND author = ?';
    values.push(req.query.author);
  }

  if (req.query.genres) {
    sql += ' AND FIND_IN_SET(?, genres)';
    values.push(req.query.genres);
  }

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

// Add to Cart
app.post('/cart', (req, res) => {
  const { userId, bookId } = req.body;
  db.query(
    'INSERT INTO carts (user_id, book_id) VALUES (?, ?)',
    [userId, bookId],
    (err) => {
      if (err) return res.status(500).send('Error');
      res.sendStatus(201);
    }
  );
});

// View Cart
app.get('/cart/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query(
    'SELECT b.* FROM books b JOIN carts c ON b.id = c.book_id WHERE c.user_id = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).send('Error');
      res.json(results);
    }
  );
});

// Checkout
app.post('/checkout', (req, res) => {
  const { userId } = req.body;
  db.query('SELECT book_id FROM carts WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).send('Error');

    const now = new Date();
    const values = results.map(row => [userId, row.book_id, now]);

    if (values.length === 0) return res.status(400).send('Cart Empty');

    db.query('INSERT INTO orders (user_id, book_id, bought_date) VALUES ?', [values], (err2) => {
      if (err2) return res.status(500).send('Error saving orders');
      db.query('DELETE FROM carts WHERE user_id = ?', [userId]);
      res.send('Order placed');
    });
  });
});

app.listen(4000, () => console.log('Server running on port 4000'));