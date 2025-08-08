const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middleware/permission');
const { PERMISSIONS } = require('../models/Permission');
const auth = require('../middleware/auth');

router.post('/create-lead', 
  auth,
  checkPermission(PERMISSIONS.ACCESS_LEAD_FORM),
  async (req, res) => {
    try {
      // Используем req.body напрямую (без sender, т.к. его нет в форме)
      const dataToSend = req.body;
      
      console.log('=== Отправляем JSON данные ===');
      console.log(JSON.stringify(dataToSend, null, 2));
      
      // Отправляем как JSON на внешний сервер через наш сервер (решает CORS)
      const response = await fetch('https://1c.mf-group.com/b24adapter/hs/redirect_queries/create_event_tg_web_app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Статус ответа от 1С:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('Успешный ответ (текст):', responseText);
        res.json({ message: 'Заявка создана', details: responseText });
      } else {
        const errorText = await response.text();
        console.error('Ошибка от внешнего сервера:', errorText);
        res.status(response.status).json({ 
          message: 'Ошибка создания заявки',
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