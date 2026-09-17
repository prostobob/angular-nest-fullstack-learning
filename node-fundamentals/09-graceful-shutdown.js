// Задание: HTTP-сервер (голый http, как в 02-raw-http-server.js) с двумя темами:
// process.env и graceful shutdown.
//
// ЧАСТЬ 1 — process.env
// Порт должен браться из process.env.PORT, а если его нет — дефолт 4000.
//
// ЧАСТЬ 2 — graceful shutdown
// Один роут: GET /slow-work — эмулирует долгую работу (setTimeout 5000ms), потом отвечает.
// По сигналу SIGTERM или SIGINT (Ctrl+C) сервер должен:
//   1. Залогировать "shutting down..."
//   2. Перестать принимать НОВЫЕ соединения, но ДОЖДАТЬСЯ, пока текущие запросы
//      (например, уже идущий /slow-work) договорят — это делает server.close(callback)
//   3. Если что-то зависло дольше 10 секунд — принудительно завершить процесс
//      (защита от вечно висящих соединений), залогировав, что это был форс-выход
//   4. В обоих случаях в конце вызвать process.exit с соответствующим кодом
//
// Проверка:
//   PORT=4500 node node-fundamentals/09-graceful-shutdown.js
//   в другом терминале: curl http://localhost:4500/slow-work   (запусти и НЕ жди ответа)
//   пока curl висит — в третьем терминале: kill -TERM <pid сервера>
//   Ожидание: сервер должен ДОЖДАТЬСЯ ответа на /slow-work (curl получит 200),
//   и только потом процесс завершится — а не оборвать соединение сразу.

const http = require('http');

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  // TODO: роут /slow-work с setTimeout 5000ms, остальное -> 404
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  if (method === 'GET' && parsedUrl.pathname === '/slow-work') {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'success', message: `slow done` }));
    }, 5000);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found', code: 404 }));
  }
});
const activeConnections = new Set();

server.on('connection', socket => {
  activeConnections.add(socket);
  socket.on('close', () => activeConnections.delete(socket));
});

function handleShutdown(signal) {
  console.log('shutting down...');

  server.close(err => {
    if (err) {
      process.exit(1);
    }
    process.exit(0);
  });

  const forceExitTimeout = setTimeout(() => {
    console.log('Таймаут ожидания истек. Принудительное прерывание оставшихся соединений...');

    for (const socket of activeConnections) {
      socket.destroy();
    }
    process.exit(1);
  }, 10000);

  forceExitTimeout.unref();
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

server.listen(PORT, () => {
  console.log(`server on http://localhost:${PORT} (pid: ${process.pid})`);
});

// TODO: обработчики process.on('SIGTERM', ...) и process.on('SIGINT', ...)
// TODO: внутри — server.close(callback) + таймаут форс-завершения на 10000ms
