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
      const dataToSend = req.body;

      console.log(JSON.stringify(dataToSend, null, 2));

      const response = await fetch(
        "https://1c.mf-group.com/b24adapter/hs/redirect_queries/send_order_auto/web",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      console.log("Статус ответа от 1С:", response.status);

      if (response.ok) {
        const successData = await response.json();
        console.log("Успешный ответ:", successData);
        res.json({ message: "Заказ создан", data: successData });
      } else {
        const errorText = await response.text();
        console.error("Ошибка от внешнего сервера:", errorText);
        res.status(response.status).json({
          message: "Ошибка создания заказа",
          status: response.status,
          details: errorText,
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
