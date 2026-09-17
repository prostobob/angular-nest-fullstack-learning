// Задание: снова предскажи порядок вывода S..Z, потом запусти
// (`node node-fundamentals/04-event-loop-order-3.js`) и сверь.
//
// Фокус специально на том, что разъехалось в прошлый раз:
// - nextTick-колбэк планирует promise-микротаску ИЗНУТРИ себя
// - promise-колбэк планирует nextTick ИЗНУТРИ себя
// - это правда две независимые очереди, и когда один "докидывает" задачу в другую
//   очередь по ходу дела — важно понять, обрабатывается ли она сразу или ждёт
//   своей очереди

async function asyncFn() {
  console.log('S - asyncFn before await');
  await null;
  console.log('T - asyncFn after await');
}

console.log('U - sync start');

asyncFn();

process.nextTick(() => {
  console.log('V - nextTick #1');
  Promise.resolve().then(() => console.log('W - promise scheduled FROM nextTick #1'));
});

Promise.resolve().then(() => {
  console.log('X - promise #1');
  process.nextTick(() => console.log('Y - nextTick scheduled FROM promise #1'));
});

process.nextTick(() => console.log('Z - nextTick #2'));

console.log('U2 - sync end');

// Твой предсказанный порядок (впиши сюда до запуска):
// 1. U
// 2. S
// 3 U2
// 4 V
// 5 Z
// 6 T
// 7 W
// 8 X
// 9 Y
