// Задание: то же правило, что в прошлый раз, но теперь с двумя `setImmediate`
// подряд вместо двух таймеров — проверяем, что "микротаски дренируются после
// КАЖДОГО колбэка" работает в любой фазе event loop, не только в timers.
// Предскажи порядок 1..7, потом запусти
// (`node node-fundamentals/06-event-loop-order-5.js`) и сверь.

console.log('1 - sync start');

setImmediate(() => {
  console.log('2 - immediate A');
  process.nextTick(() => console.log('3 - nextTick from immediate A'));
});

setImmediate(() => {
  console.log('4 - immediate B');
  Promise.resolve().then(() => console.log('5 - promise from immediate B'));
});

setTimeout(() => console.log('6 - timer'), 0);

console.log('7 - sync end');

// Твой предсказанный порядок (впиши сюда до запуска):
// 1. 1
// 2. 7
// 3 2
// 4 3
// 5 4
// 6 6
// 7 5
