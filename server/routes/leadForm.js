const express = require("express");
const router = express.Router();
const { checkPermission } = require("../middleware/permission");
const { PERMISSIONS } = require("../models/Permission");
const auth = require("../middleware/auth");

router.post(
  "/create-lead",
  auth,
  checkPermission(PERMISSIONS.ACCESS_LEAD_FORM),
  async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
      
      const dataToSend = req.body;

      console.log("=== Отправляем заявку в 1С ===");
      console.log(JSON.stringify(dataToSend, null, 2));

      const response = await fetch(
        "https://1c.mf-group.com/b24adapter/hs/redirect_queries/create_event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": token 
          },
          body: JSON.stringify(dataToSend),
        }
      );

      console.log("Статус ответа от 1С:", response.status);

      if (response.ok) {
        // ✅ Правильно обрабатываем ответ (может быть JSON или текст)
        const contentType = response.headers.get('content-type');
        let successResponse;
        
        if (contentType && contentType.includes('application/json')) {
          successResponse = await response.json();
        } else {
          successResponse = await response.text();
        }
        
        console.log("Успешный ответ от 1С:", successResponse);
        res.json({ 
          message: "Заявка успешно создана",
          details: successResponse 
        });
      } else {
        // ✅ Правильно обрабатываем ошибку
        const contentType = response.headers.get('content-type');
        let errorDetails;
        
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          errorDetails = await response.text();
        }
        
        console.error("Ошибка от 1С:", errorDetails);
        res.status(response.status).json({
          message: "Ошибка при создании заявки",
          status: response.status,
          details: errorDetails
        });
      }
    } catch (error) {
      console.error("Ошибка сервера:", error);
      res.status(500).json({
        message: "Ошибка сервера",
        error: error.message
      });
    }
  }
);

module.exports = router;