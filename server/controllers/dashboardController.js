const https = require('https');

const getTestData = async (req, res) => {
  try {
    // Получаем токен из заголовка Authorization
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    // Делаем запрос к внешнему серверу
    const externalUrl = `https://1c.mf-group.com/b24adapter/hs/inc_query/get_test_user_data/${token}`;
    
    // Игнорируем SSL ошибки (только для тестирования)
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });

    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      agent: agent
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Ошибка от внешнего сервера: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Ошибка при получении тестовых данных:', error);
    res.status(500).json({ error: 'Ошибка сервера', details: error.message });
  }
};

module.exports = { getTestData };