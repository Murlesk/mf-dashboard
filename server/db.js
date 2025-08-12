const { Pool } = require('pg');
require('dotenv').config();

// ✅ Полностью отключаем SSL для локальной разработки
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false, // ✅ Всегда false для локальной разработки
  // ✅ Добавляем дополнительные параметры для предотвращения SSL
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// ✅ Добавляем логирование подключения
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
    console.error('Проверьте параметры подключения в .env файле:');
    console.error('DB_HOST:', process.env.DB_HOST);
    console.error('DB_PORT:', process.env.DB_PORT);
    console.error('DB_USER:', process.env.DB_USER);
    console.error('DB_NAME:', process.env.DB_NAME);
    console.error('SSL отключен:', true);
  } else {
    console.log('✅ Подключение к БД успешно');
    console.log('БД:', process.env.DB_NAME, '@', process.env.DB_HOST);
  }
});

// ✅ Добавляем обработчики ошибок пула
pool.on('error', (err) => {
  console.error('❌ Неожиданная ошибка в пуле подключений:', err.message);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};