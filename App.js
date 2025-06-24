import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [mode, setMode] = useState('login');
  const [userId, setUserId] = useState(() => {
  return localStorage.getItem('userId') || null;
});


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [books, setBooks] = useState([]);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterGenre, setFilterGenre] = useState('');

  const [cart, setCart] = useState([]);

  const handleSignup = async () => {
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setMode('login');
    alert('Signup successful, please login');
  };

  const handleLogin = async () => {
    const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUserId(data.userId);
      localStorage.setItem('userId', data.userId);
      fetchBooks();
      fetchCart(data.userId);
    } else {
      alert('Login failed');
    }
  };
  
  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('userId'); // Clear login info
    setCart([]);
  };

  const fetchBooks = async () => {
    let url = 'http://localhost:4000/books';
    const params = [];
    if (filterAuthor) params.push(`author=${filterAuthor}`);
    if (filterGenre) params.push(`genres=${filterGenre}`);
    if (params.length > 0) url += '?' + params.join('&');

    const res = await fetch(url);
    const data = await res.json();
    setBooks(data);
  };

  const addToCart = async (bookId) => {
    await fetch('http://localhost:4000/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bookId }),
    });
    fetchCart(userId);
  };

  const fetchCart = async (uid) => {
    const res = await fetch(`http://localhost:4000/cart/${uid}`);
    const data = await res.json();
    setCart(data);
  };

  const handleCheckout = async () => {
    await fetch('http://localhost:4000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    alert('Order placed!');
    fetchCart(userId);
  };

  if (!userId) {
    return (
      <div className="form-box">
        <h2>{mode === 'login' ? 'Login' : 'Signup'}</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {mode === 'login' ? (
          <>
            <button onClick={handleLogin}>Login</button>
            <p onClick={() => setMode('signup')}>Don't have an account? Sign up</p>
          </>
        ) : (
          <>
            <button onClick={handleSignup}>Signup</button>
            <p onClick={() => setMode('login')}>Already have an account? Login</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Online Bookstore</h1>

      <div className="filters">
        <input
          placeholder="Filter by author"
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
        />
        <input
          placeholder="Filter by genre"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        />
        <button onClick={fetchBooks}>Apply Filter</button>
      </div>

      <div className="book-list">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <img src={book.image_url} alt={book.name} />
            <h4>{book.name}</h4>
            <p>{book.author}</p>
            <p>{book.genres}</p>
            <p>{new Date(book.published_date).toLocaleDateString()}</p>
            <button onClick={() => addToCart(book.id)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <div className="cart">
        <h2>Your Cart</h2>
        {cart.length === 0 ? <p>Cart is empty</p> : (
          <>
            <ul>
              {cart.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <button onClick={handleCheckout}>Buy Now</button>
          </>
        )}
        <div className="logout-container">
          <button className='logout-button' onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default App;