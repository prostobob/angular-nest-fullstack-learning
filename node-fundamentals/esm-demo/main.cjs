// Задание: этот файл — CommonJS (расширение .cjs, никаких import/export верхнего уровня).
// Рядом лежит mathUtils.mjs — настоящий ESM-модуль.
//
// Шаг 1. Раскомментируй строку ниже и запусти (`node node-fundamentals/esm-demo/main.cjs`).
// Посмотри на текст ошибки внимательно — она прямо называет проблему.
//
// const { add } = require('./mathUtils.mjs');
//
// Шаг 2. Закомментируй обратно строку выше. CommonJS (require) не умеет синхронно
// загружать ESM-модули — в отличие от обратного направления (ESM спокойно
// импортирует CJS через `import`). Единственный мост из CJS в ESM — динамический
// `import()`, который асинхронный (возвращает Promise), даже если ты его не ждёшь
// никакого I/O.
//
// TODO: напиши async-функцию main(), которая через `await import('./mathUtils.mjs')`
// получает модуль, достаёт из него `add` (named export) и `default` (это multiply),
// и печатает add(2, 3) и default(2, 3).

async function main() {
  const utils = await import('./mathUtils.mjs');
  console.log(utils.add(2, 3));
  console.log(utils.default(2, 3));
}

main();
