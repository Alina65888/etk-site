/**
 * Тонкий прокси между сайтом конкурса ЭТК и JSONBin.io.
 *
 * Зачем прокси, а не прямой fetch с клиента в JSONBin: мастер-ключ JSONBin даёт
 * полный доступ на чтение и запись бина. Если бы админка обращалась к JSONBin
 * напрямую, этот ключ пришлось бы отдать в код страницы — и его увидел бы любой
 * посетитель через "Просмотр кода страницы". Здесь ключ JSONBin живёт только на
 * сервере (переменная окружения), а клиенту известен только отдельный простой
 * пароль администратора (ADMIN_KEY) для операций записи.
 *
 * GET  /api/data  — отдаёт текущие данные всем (публичная страница и админка)
 * POST /api/data  — сохраняет данные, только если передан верный заголовок X-Admin-Key
 */
const express = require('express');
const cors = require('cors');

const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_KEY = process.env.JSONBIN_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;
const PORT = process.env.PORT || 3000;

if (!JSONBIN_BIN_ID || !JSONBIN_KEY || !ADMIN_KEY) {
  console.error(
    'ETK API: не заданы переменные окружения JSONBIN_BIN_ID, JSONBIN_KEY и/или ADMIN_KEY. ' +
    'Задайте их в настройках сервиса на Render перед деплоем.'
  );
  process.exit(1);
}

const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID;

const app = express();
app.use(cors());
app.use(express.json({ limit: '3mb' }));

app.get('/api/data', async (req, res) => {
  try {
    const r = await fetch(JSONBIN_URL + '/latest', {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    if (!r.ok) throw new Error('JSONBin вернул ' + r.status);
    const body = await r.json();
    res.json(body.record);
  } catch (e) {
    console.error('GET /api/data failed:', e.message);
    res.status(502).json({ error: 'Не удалось получить данные из хранилища' });
  }
});

app.post('/api/data', async (req, res) => {
  if (req.get('X-Admin-Key') !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Неверный пароль администратора' });
  }
  try {
    const r = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify(req.body)
    });
    if (!r.ok) throw new Error('JSONBin вернул ' + r.status);
    res.json({ ok: true });
  } catch (e) {
    console.error('POST /api/data failed:', e.message);
    res.status(502).json({ error: 'Не удалось сохранить данные в хранилище' });
  }
});

app.listen(PORT, () => {
  console.log('ETK API слушает порт ' + PORT);
});
