const fs = require('fs');
const path = require('path');

const getEventsList = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    console.log('=== Получаем список мероприятий ===');
    console.log('Token:', token ? 'присутствует' : 'отсутствует');

    // Делаем запрос к внешнему серверу
    const externalUrl = `https://1c.mf-group.com/b24adapter/hs/inc_query/get_user_events/${token}`;
    
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

    console.log('Статус ответа от 1С:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Успешный ответ от 1С:', JSON.stringify(data, null, 2));

      // ✅ Сканируем папку pdfs и добавляем файлы
      const pdfsDir = path.join(__dirname, '../../form-app/public/pdfs');
      let drawings = [];
      
      try {
        if (fs.existsSync(pdfsDir)) {
          const files = fs.readdirSync(pdfsDir);
          drawings = files
            .filter(file => file.endsWith('.pdf'))
            .map(file => ({
              name: file.replace('.pdf', ''), // Убираем .pdf из имени
              fileName: file, // Полное имя файла
              size: getFileSize(path.join(pdfsDir, file)) // Размер файла
            }));
        }
      } catch (err) {
        console.error('Ошибка сканирования папки pdfs:', err);
        drawings = []; // Если ошибка - возвращаем пустой массив
      }

      // ✅ Добавляем чертежи ко всем мероприятиям
      const enrichedData = {
        ...data,
        grouped: {
          ...data.grouped,
          past: data.grouped?.past?.map(event => ({
            ...event,
            drawings: drawings // ✅ Добавляем чертежи
          })) || [],
          current: data.grouped?.current?.map(event => ({
            ...event,
            drawings: drawings // ✅ Добавляем чертежи
          })) || [],
          future: data.grouped?.future?.map(event => ({
            ...event,
            drawings: drawings // ✅ Добавляем чертежи
          })) || []
        }
      };

      res.json(enrichedData);
    } else {
      const errorText = await response.text();
      console.error('Ошибка от внешнего сервера:', errorText);
      res.status(response.status).json({
        message: 'Ошибка от внешнего сервера',
        status: response.status,
        details: errorText,
      });
    }
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: error.message,
    });
  }
};

// ✅ Функция получения размера файла
const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (err) {
    return 'Размер неизвестен';
  }
};

module.exports = { getEventsList };