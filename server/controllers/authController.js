const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Поиск пользователя без учета регистра
    const user = await db.query(
      'SELECT user_id, username, name, password_hash, role FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Проверка пароля
    const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Генерация токена (добавляем name)
    const token = jwt.sign(
      { 
        userId: user.rows[0].user_id, 
        role: user.rows[0].role,
        name: user.rows[0].name  // Добавляем имя в токен
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: {
        id: user.rows[0].user_id,
        username: user.rows[0].username,
        name: user.rows[0].name,  // Добавляем имя в ответ
        role: user.rows[0].role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login };