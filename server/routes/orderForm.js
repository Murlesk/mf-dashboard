const express = require("express");
const router = express.Router();
const { checkPermission } = require("../middleware/permission");
const { PERMISSIONS } = require("../models/Permission");
const auth = require("../middleware/auth");

router.post(
  "/create-order",
  auth,
  checkPermission(PERMISSIONS.ACCESS_ORDER_FORM),
  async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
      
      const dataToSend = req.body;

      console.log("=== Отправляем заказ в 1С ===");
      console.log(JSON.stringify(dataToSend, null, 2));

      const response = await fetch(
        "https://1c.mf-group.com/b24adapter/hs/redirect_queries/send_order_auto/web",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": token // Без Bearer
          },
          body: JSON.stringify(dataToSend),
        }
      );

      console.log("Статус ответа от 1С:", response.status);

      if (response.ok) {
        // ✅ Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        
        let successData;
        if (contentType && contentType.includes('application/json')) {
          // Если ответ JSON
          successData = await response.json();
        } else {
          // Если ответ текст
          successData = await response.text();
        }
        
        console.log("Успешный ответ:", successData);
        res.json({ 
          message: "Заказ успешно создан", 
          details: successData 
        });
      } else {
        // ✅ Обрабатываем ошибку правильно
        const contentType = response.headers.get('content-type');
        let errorDetails;
        
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          errorDetails = await response.text();
        }
        
        console.error("Ошибка от внешнего сервера:", errorDetails);
        res.status(response.status).json({
          message: "Ошибка создания заказа",
          status: response.status,
          details: errorDetails,
        });
      }
    } catch (error) {
      console.error("Ошибка сервера:", error);
      res.status(500).json({
        message: "Ошибка сервера",
        error: error.message,
      });
    }
  }
);

module.exports = router;