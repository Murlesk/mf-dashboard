const { pool } = require('../db');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;
  
  try {
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email AND Password = @password');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const token = jwt.sign(
      { userId: user.Id, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.Role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { login };