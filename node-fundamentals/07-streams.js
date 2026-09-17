// Задание: streams vs "загрузить всё в память". Три части, все TODO ниже.
//
// Запуск (два отдельных процесса, чтобы память одного не смешивалась с другим):
//   node node-fundamentals/07-streams.js generate   <- один раз, создаёт тестовый файл
//   node node-fundamentals/07-streams.js sync        <- копирует через readFileSync/writeFileSync
//   node node-fundamentals/07-streams.js stream       <- копирует через createReadStream/pipe
//
// В конце сравни, что напечатали 'sync' и 'stream' — peak RSS должен отличаться
// в разы, хотя оба скопировали один и тот же файл и результат на диске одинаковый.

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const BIG_FILE = path.join(os.tmpdir(), 'node-fundamentals-big.bin');
const COPY_FILE = path.join(os.tmpdir(), 'node-fundamentals-big-copy.bin');
const FILE_SIZE_MB = 150;

// ЧАСТЬ 1: сгенерировать тестовый файл ~150MB через writable stream.
// Пиши случайные чанки (например, по 1MB через crypto.randomBytes) в цикле.
// ВАЖНО: `writable.write(chunk)` возвращает false, если внутренний буфер переполнен —
// в этом случае нужно ДОЖДАТЬСЯ события 'drain', прежде чем писать дальше, иначе ты
// просто эмулируешь readFileSync — зальёшь всё в память вместо контролируемого потока.
// Это и есть backpressure, которую .pipe() обычно решает за тебя автоматически.
function generateBigFile() {
  const writableStream = fs.createWriteStream(BIG_FILE);
  let currentSize = 0;
  // TODO: реализовать генерацию файла размером FILE_SIZE_MB с ручным backpressure
  function writeMore() {
    while (currentSize < FILE_SIZE_MB * 1024 * 1024) {
      const chunk = crypto.randomBytes(1024 * 1024);
      currentSize += chunk.length;

      if (!writableStream.write(chunk)) {
        writableStream.once('drain', writeMore);
        return;
      }
    }

    writableStream.end();
  }
  writeMore();
}

// ЧАСТЬ 2: скопировать файл целиком через readFileSync + writeFileSync
function copySync() {
  const buffer = fs.readFileSync(BIG_FILE);
  fs.writeFileSync(COPY_FILE, buffer);
}

// ЧАСТЬ 3: скопировать файл через createReadStream().pipe(createWriteStream())
// Дождись события 'finish' на writable, прежде чем считать копирование завершённым.
function copyStreamed() {
  return new Promise((resolve, reject) => {
    const copy = fs.createReadStream(BIG_FILE).pipe(fs.createWriteStream(COPY_FILE));
    copy.on('finish', () => {
      resolve(copy);
      console.log('Копия файла успешно создана через pipe!');
    });
  });
}

async function printPeakMemory(label, fn) {
  // TODO: замерь process.memoryUsage().rss до и после fn(), выведи разницу в MB
  // подсказка: для streamed-версии, поскольку она асинхронная, интересно ещё
  // засэмплировать память несколько раз ПОКА копирование идёт (например, раз в 50мс),
  // а не только в начале и в конце — иначе можно не заметить, что пик всё это время
  // остаётся низким и плоским, а не был кратким скачком
  const rssBefore = process.memoryUsage().rss;
  let maxRssDuring = rssBefore;

  const interval = setInterval(() => {
    const currentRss = process.memoryUsage().rss;
    if (currentRss > maxRssDuring) {
      maxRssDuring = currentRss;
    }
  }, 50);

  try {
    await Promise.resolve(fn());
  } catch (err) {
    console.error(`Ошибка во время ${label}:`, err);
  } finally {
    clearInterval(interval);
  }

  const rssAfter = process.memoryUsage().rss;
  const toMb = bytes => (bytes / 1024 / 1024).toFixed(2);

  console.log(`\n=== Результаты для [${label}] ===`);
  console.log(`Разница (После - До): ${toMb(rssAfter - rssBefore)} МБ`);

  if (maxRssDuring === rssBefore) {
    console.log(`Пиковое увеличение во время выполнения: Не зафиксировано (Event Loop был заблокирован!)`);
    console.log(`Реальный пик равен финальной разнице: +${toMb(rssAfter - rssBefore)} МБ`);
  } else {
    console.log(`Пиковое увеличение RSS во время выполнения (на лету): +${toMb(maxRssDuring - rssBefore)} МБ`);
  }
}

const mode = process.argv[2];

if (mode === 'generate') {
  generateBigFile();
} else if (mode === 'sync') {
  printPeakMemory('sync copy', copySync);
} else if (mode === 'stream') {
  printPeakMemory('stream copy', copyStreamed);
} else {
  console.log('Usage: node 07-streams.js <generate|sync|stream>');
}
