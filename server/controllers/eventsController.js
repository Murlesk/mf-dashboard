const https = require('https');

const getEventsList = async (req, res) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    console.log('=== Получаем список мероприятий ===');
    console.log('Token:', token ? 'присутствует' : 'отсутствует');

    // Делаем запрос к внешнему серверу 1С
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка от внешнего сервера:', errorText);
      return res.status(response.status).json({ 
        error: `Ошибка от внешнего сервера: ${response.status}`,
        details: errorText
      });
    }

    const rawData = await response.json();
    console.log('Получены сырые данные от 1С:', JSON.stringify(rawData, null, 2));

    // ✅ Проверяем, что rawData - массив
    let eventsArray = [];
    if (Array.isArray(rawData)) {
      // Если rawData уже массив
      eventsArray = rawData;
    } else if (rawData && typeof rawData === 'object' && rawData.events) {
      // Если rawData объект с полем events
      eventsArray = Array.isArray(rawData.events) ? rawData.events : [];
    } else {
      // Если rawData - объект, преобразуем в массив
      eventsArray = [rawData];
    }

    // ✅ Обрабатываем данные и группируем по актуальности
    const processedEvents = eventsArray.map((event, index) => ({
      id: event.id || index,
      dateBegin: event.dateBegin,
      dateEnd: event.dateEnd,
      location: event.location,
      name: event.name,
      debt: event.debt || 0,
      relevance: event.relevance || 'current', // 'past', 'current', 'future'
      goods: event.goods || '',
      weight: event.weight || 0,
      comment: event.comment || '',
      region: event.region || '',
      address1: event.address1 || '',
      address2: event.address2 || '',
      customer: event.customer || '',
      organization: event.organization || ''
    }));

    // ✅ Группируем по типам актуальности
    const groupedEvents = {
      past: processedEvents.filter(event => event.relevance === 'past'),
      current: processedEvents.filter(event => event.relevance === 'current'),
      future: processedEvents.filter(event => event.relevance === 'future')
    };

    console.log('Сгруппированы мероприятия:');
    console.log('- Прошлые:', groupedEvents.past.length);
    console.log('- Текущие:', groupedEvents.current.length);
    console.log('- Будущие:', groupedEvents.future.length);

    res.json({ 
      events: processedEvents,
      grouped: groupedEvents
    });
  } catch (error) {
    console.error('❌ Ошибка при получении списка мероприятий:', error);
    res.status(500).json({ 
      error: 'Ошибка сервера', 
      details: error.message 
    });
  }
};

module.exports = { getEventsList };