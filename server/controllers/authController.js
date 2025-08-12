const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log('=== Попытка входа ===');
  console.log('Полученные данные:', req.body);

  try {
    const result = await query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ message: 'Успешный вход', token });
  } catch (error) {
    console.error('Ошибка при входе:', error.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Поиск пользователя по username
    const user = await db.query(
      'SELECT user_id, username, email, name, password_hash, role FROM users WHERE LOWER(username) = LOWER($1)',
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

    // 3. Генерация токена
    const token = jwt.sign(
      { userId: user.rows[0].user_id, role: user.rows[0].role, name: user.rows[0].name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Отправляем POST запрос на внешний сервер
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      // Логируем данные, которые отправляем
      const requestData = {
        username: user.rows[0].email,
        token: token,
        date: expirationDate.toISOString()
      };
      
      console.log('Отправляем данные во внешнюю систему:', JSON.stringify(requestData, null, 2));
      
      const externalResponse = await fetch('https://1c.mf-group.com/b24adapter/hs/inc_query/register_token/07e10eae-630c-4115-8f43-c7e4ceb01d10', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('Статус ответа от внешнего сервера:', externalResponse.status);
      
      // Попробуем получить текст ответа для диагностики
      const responseText = await externalResponse.text();
      console.log('Текст ответа от внешнего сервера:', responseText);

      if (externalResponse.ok) {
        console.log('Токен успешно зарегистрирован во внешней системе');
      } else {
        console.error(`Ошибка ${externalResponse.status}:`, responseText);
      }
    } catch (externalError) {
      console.error('Ошибка при отправке запроса во внешнюю систему:', externalError.message);
      console.error('Stack trace:', externalError.stack);
    }

    // 5. Отправляем ответ клиенту
    res.json({ 
      token,
      user: {
        id: user.rows[0].user_id,
        username: user.rows[0].username,
        email: user.rows[0].email,
        name: user.rows[0].name,
        role: user.rows[0].role
      }
    });
  } catch (err) {
    console.error('Ошибка в контроллере логина:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login };