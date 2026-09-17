// Задание: НЕ запускай сразу. Сначала выпиши порядок, в котором, по-твоему,
// напечатаются строки 'A'..'H'. Потом запусти (`node node-fundamentals/01-event-loop-order.js`)
// и сравни. Если разошлось — не подглядывай в объяснение, попробуй сам понять почему,
// потом сверимся.
//
// Подсказка (не спойлер): в Node это не совсем то же самое, что event loop в браузере,
// который ты знаешь по RxJS/зоне Angular — здесь есть отдельная фаза для I/O callbacks
// (setImmediate) и микротаски двух видов (process.nextTick И promise microtask queue,
// это разные очереди с разным приоритетом).

const fs = require('fs');

console.log('A - sync start');

setTimeout(() => console.log('B - setTimeout 0'), 0);

setImmediate(() => console.log('C - setImmediate'));

fs.readFile(__filename, () => {
  console.log('D - fs.readFile callback (I/O)');

  setTimeout(() => console.log('E - setTimeout inside I/O callback'), 0);
  setImmediate(() => console.log('F - setImmediate inside I/O callback'));
});

Promise.resolve().then(() => console.log('G - promise microtask'));

process.nextTick(() => console.log('H - process.nextTick'));

console.log('A2 - sync end');

// Твой предсказанный порядок (впиши сюда до запуска):
// 1. A
// 2. С
// 3 B
// 4 F
// 5 E
// 6 G
// 7 A2
// 8 H
