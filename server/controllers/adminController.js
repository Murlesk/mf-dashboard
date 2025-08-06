const db = require('../db');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
  try {
    // Проверяем права доступа
    const { username: requesterUsername, role } = req.user;
    
    // Только i.potaenko или админ может создавать пользователей
    if (requesterUsername !== 'i.potaenko' && role !== 'admin') {
      return res.status(403).json({ 
        message: 'У вас нет прав для создания пользователей' 
      });
    }

    const { username, password, email, name, role: userRole } = req.body;

    // Валидация данных
    if (!username || !password || !email || !name || !userRole) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Проверяем, существует ли пользователь с таким username
    const existingUser = await db.query(
      'SELECT username FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Пользователь с таким username уже существует' 
      });
    }

    // Хэшируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаём пользователя
    const result = await db.query(
      'INSERT INTO users (username, password_hash, role, email, name) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, name, role',
      [username, hashedPassword, userRole, email, name]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Пользователь успешно создан',
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при создании пользователя' 
    });
  }
};

module.exports = { createUser };