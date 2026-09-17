// Задание: как обычно — предскажи порядок 1..8, потом запусти
// (`node node-fundamentals/05-event-loop-order-4.js`) и сверь.
//
// Новое:
// - `queueMicrotask` — стандартный (не-Node-специфичный) способ поставить микротаску,
//   по приоритету он в той же очереди, что и promise .then
// - главный вопрос раунда: микротаски (nextTick + promise) дренируются ТОЛЬКО один раз
//   в самом конце, после всех колбэков? Или после КАЖДОГО отдельного колбэка,
//   даже если это колбэк макротаски (например, таймера)?
// - два setTimeout с одинаковой задержкой (0) — в каком порядке они сработают
//   относительно друг друга?

console.log('1 - sync start');

setTimeout(() => {
  console.log('2 - timer A');
  process.nextTick(() => console.log('3 - nextTick inside timer A'));
  Promise.resolve().then(() => console.log('4 - promise inside timer A'));
}, 0);

setTimeout(() => {
  console.log('5 - timer B');
}, 0);

setImmediate(() => console.log('6 - setImmediate top-level'));

queueMicrotask(() => console.log('7 - queueMicrotask top-level'));

console.log('8 - sync end');

// Твой предсказанный порядок (впиши сюда до запуска):
// 1. 1
// 2. 8
// 3 6
// 4 7
// 5 2
// 6 5
// 7 3
// 8 4
