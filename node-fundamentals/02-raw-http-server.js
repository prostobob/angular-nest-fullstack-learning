// Задание: реализуй HTTP-сервер БЕЗ express на голом `http`, чтобы руками увидеть,
// что Express/Nest делают за тебя (роутинг, парсинг URL, отправка JSON).
//
// Требования:
// 1. GET /slow  -> подожди 2 секунды (setTimeout) и ответь { message: 'slow done' }
// 2. GET /fast  -> ответь сразу { message: 'fast done' }
// 3. Любой другой путь -> 404 { error: 'not found' }
// 4. Ответы должны быть валидным JSON с заголовком 'Content-Type: application/json'
//
// Проверка, что сервер неблокирующий:
//   в одном терминале:  curl http://localhost:3001/slow
//   сразу во втором:    curl http://localhost:3001/fast
//   -> /fast должен ответить мгновенно, НЕ дожидаясь /slow, хотя это один процесс
//      и один поток (в этом и есть суть неблокирующего I/O в Node)
//
// Не используй express/http-фреймворки — только встроенный модуль 'http'.

const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  if (method === 'GET' && parsedUrl.pathname === '/slow') {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', message: `slow done` }));
    }, 2000);
  } else if (method === 'GET' && parsedUrl.pathname === '/fast') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', message: `fast done` }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found', code: 404 }));
  }
});

server.listen(PORT, () => {
  console.log(`raw http server on http://localhost:${PORT}`);
});
