const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../models/Permission');
const auth = require('../middleware/auth');
const https = require('https');

// Защищённый маршрут для получения списка мероприятий
router.get('/list', 
  auth, 
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
      }

      const externalUrl = `https://1c.mf-group.com/b24adapter/hs/inc_query/get_user_events/${token}`;
      
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

      if (response.ok) {
        const data = await response.json();
        res.json(data);
      } else {
        const errorText = await response.text();
        res.status(response.status).json({
          message: 'Ошибка от внешнего сервера',
          status: response.status,
          details: errorText
        });
      }
    } catch (error) {
      console.error('Ошибка сервера:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера', 
        error: error.message 
      });
    }
  }
);

// ✅ Новый маршрут для получения ОДНОГО мероприятия по ID
router.get('/:id', 
  auth,
  checkPermission(PERMISSIONS.VIEW_DASHBOARD),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const token = req.headers['authorization']?.split(' ')[1];
      
      if (!eventId) {
        return res.status(400).json({ message: 'ID мероприятия не указан' });
      }

      if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
      }

      console.log('=== Получаем мероприятие по ID ===');
      console.log('ID:', eventId);
      console.log('Token:', token ? 'присутствует' : 'отсутствует');

      // ✅ Используем правильный URL с токеном и ID
      const externalUrl = `https://1c.mf-group.com/b24adapter/hs/inc_query/get_user_events/${token}`;
      
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

      console.log('Статус ответа от 1С:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Успешный ответ от 1С:', JSON.stringify(data, null, 2));
        res.json(data);
      } else {
        const errorText = await response.text();
        console.error('Ошибка от внешнего сервера:', errorText);
        res.status(response.status).json({
          message: 'Ошибка от внешнего сервера',
          status: response.status,
          details: errorText
        });
      }
    } catch (error) {
      console.error('Ошибка сервера:', error);
      res.status(500).json({ 
        message: 'Ошибка сервера', 
        error: error.message 
      });
    }
  }
);

module.exports = router;