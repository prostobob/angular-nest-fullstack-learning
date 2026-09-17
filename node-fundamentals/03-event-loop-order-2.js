// Задание: как в прошлый раз — сначала предскажи порядок вывода I..T, потом запусти
// (`node node-fundamentals/03-event-loop-order-2.js`) и сверь.
//
// Новое по сравнению с прошлым разом:
// - async/await: помни, что всё ПОСЛЕ await в async-функции — это .then()-коллбэк,
//   то есть promise-микротаска, а не "продолжение синхронного кода"
// - .then().then() — цепочка из двух микротасков, это два "хода" очереди, не один
// - process.nextTick ВНУТРИ process.nextTick — та очередь дренируется ПОЛНОСТЬЮ,
//   включая то, что в неё добавили по ходу дренирования, ПРЕЖДЕ чем перейти
//   к promise-микротаскам

const fs = require('fs');

async function asyncFn() {
  console.log('I - asyncFn before await');
  await null;
  console.log('J - asyncFn after await');
}

console.log('K - sync start');

setTimeout(() => console.log('L - setTimeout 0'), 0);

asyncFn();

Promise.resolve()
  .then(() => console.log('M - promise .then #1'))
  .then(() => console.log('N - promise .then #2'));

process.nextTick(() => {
  console.log('O - nextTick #1');
  process.nextTick(() => console.log('P - nextTick #1 nested'));
});

fs.readFile(__filename, () => {
  console.log('Q - fs.readFile callback');
});

process.nextTick(() => console.log('R - nextTick #2'));

console.log('K2 - sync end');

// Твой предсказанный порядок (впиши сюда до запуска):
// 1.K1
// 2.k2
// 3 I
// 4 O
// 5 P
// 6 R
// 7 J
// 8 M
// 9 N
// 10 Q
// 11 L
