# Fullstack-план: Angular (уже есть) + Node/Express → NestJS

Контекст: Angular-фронтенд (`src/`) — готовый RealWorld-клиент, сейчас ходит на публичный
`https://api.realworld.show/api` (см. `src/app/core/interceptors/api.interceptor.ts`).
Контракт API — `realworld/specs/api/openapi.yml`, автотесты контракта — `realworld/specs/api/hurl/*.hurl`
(есть раннер `realworld/specs/api/run-api-tests-hurl.sh`).

Цель: реализовать этот же API дважды — сначала на чистом Node (Express), потом на NestJS
(`backend/`, уже есть скелет с stub `ArticlesModule`) — и сравнить подходы. Angular не трогаем,
кроме финального переключения `apiUrl` с публичного бэкенда на свой.

Оба бэкенда используют один и тот же слой БД (Postgres + Knex query builder, без ORM-магии),
чтобы сравнение было именно "фреймворк vs фреймворк", а не "ORM vs ORM".

---

## Трек 0 — Node.js fundamentals (что Express/Nest прячут под капотом) — ЗАКРЫТ

- [x] Event loop: microtask vs macrotask, `process.nextTick` vs `setImmediate`
      (5 раундов предсказания порядка — `node-fundamentals/01-event-loop-order.js`,
      `03-event-loop-order-2.js`, `04-event-loop-order-3.js`, `05-event-loop-order-4.js`,
      `06-event-loop-order-5.js`)
- [x] Голый `http.createServer` без фреймворка — руками распарсить `req.url`/`req.method`, отдать JSON
      (`node-fundamentals/02-raw-http-server.js`, подтверждено неблокирующее поведение через curl)
- [x] Streams & Buffer (`fs.createReadStream`) — пригодится в стретч-цели с upload
      (`node-fundamentals/07-streams.js`: sync-копия 150MB файла = +150.55MB RSS,
      streamed-копия = +34MB RSS — наглядная разница)
- [x] CommonJS vs ESM, `package.json` (`exports`, `type`)
      (`node-fundamentals/esm-demo/` — поймали `ERR_REQUIRE_ESM` и мост через `await import()`)
- [x] `node --inspect` / `--inspect-brk` — дебаг Node-процесса в Chrome DevTools
      (опробовано вживую на одном из файлов трека 0)
- [x] `process.env`, graceful shutdown на `SIGTERM`
      (`node-fundamentals/09-graceful-shutdown.js` — подтверждено: SIGTERM дожидается
      активный запрос перед выходом, форс-таймаут на 10с как safety net)

---

## Трек 1 — Node + Express, без Nest (`backend-node/`, новый проект рядом с `backend/`)

Стек: `express`, `typescript` + `tsx` (watch), `dotenv`, `knex` + `pg`, `zod` (валидация),
`jsonwebtoken`, `bcrypt`.

### 1.1 Скелет — В ПРОЦЕССЕ

- [ ] `backend-node/` — `src/server.ts`, `src/db.ts` (knex instance), `src/middlewares/`, `src/routes/`
- [x] Docker установлен и работает: `brew install colima docker docker-compose` + `colima start`,
      `docker ps` и `docker compose version` подтверждены (2026-09-17)
- [x] Docker Compose с Postgres (общий для обоих треков) — `docker-compose.yml` в корне,
      контейнер `proj-postgres` поднят и здоров (`docker compose ps` → `Up (healthy)`,
      `pg_isready` отвечает) (2026-09-17)

### 1.2 Инфраструктура (всё руками, без магии фреймворка) — ЗАКРЫТ

- [x] JSON body parser (`express.json()`)
- [x] Самописный request-логгер (`src/middlewares/logger.ts`, лог на `res.on('finish')`)
- [x] Auth middleware: заголовок `Authorization: Token <jwt>` — **важно**: у RealWorld схема `Token`, не `Bearer`
      (`src/middlewares/auth.ts`, навешивается точечно на роуты, не глобально — иначе ломает 404
      для незащищённых путей)
- [x] Централизованный error handler `(err, req, res, next)` → формат ошибок `{"errors": {"body": [...]}}`
      (`ApiError` в `src/errors/api-error.ts` несёт `statusCode` + `errors: string[]`, 404-хендлер
      и error handler в `server.ts`)
- [x] `validate(schema)` — фабрика middleware на `zod`, вешается на каждый роут вручную
      (`src/middlewares/validate.ts`, `safeParse` → 422 с массивом сообщений при невалидных данных,
      проверено smoke-тестом: невалидный body → 422 с сообщениями от Zod, валидный → проходит дальше)

### 1.3 БД (Knex-миграции)

- [x] Таблицы: `users`, `articles`, `tags`, `article_tags`, `comments`, `favorites` (M2M user↔article),
      `follows` (self-M2M user↔user) — все миграции в `src/migrations/`, проверены `migrate`/
      `migrate:rollback`/`migrate` round-trip и живыми constraint'ами в Postgres (уникальность,
      композитные PK на join-таблицах, FK с осмысленным `onDelete`)
- [ ] Джойны/агрегации (`favoritesCount`, `tagList`, `following`) пишутся руками через query builder
      — будет по ходу написания роутов в 1.4

### 1.4 Роуты — по порядку зависимостей, сверяясь с `openapi.yml`

- [ ] Auth: `POST /users`, `POST /users/login` (bcrypt hash, jwt sign)
- [ ] `GET/PUT /user` (под auth middleware)
- [ ] Profiles + follow/unfollow
- [ ] Articles CRUD + slug generation + пагинация/фильтры (`tag`, `author`, `favorited`, `limit`/`offset`)
- [ ] Feed (`GET /articles/feed`)
- [ ] Favorites
- [ ] Comments
- [ ] Tags

После каждого блока — прогнать соответствующий `realworld/specs/api/hurl/*.hurl` против
`backend-node` (указать локальный порт в env hurl-раннера).

### 1.5 Тесты

- [ ] Настроить Vitest/Jest с нуля (transform для TS, test env, supertest поверх `app`)
- [ ] Unit-тесты сервис-функций (без завязки на `req`/`res`)
- [ ] E2E через supertest по роутам

### 1.6 Подключение фронтенда (первая интеграция)

- [ ] `cors` middleware под `localhost:4200`
- [ ] В Angular: `environment.ts`/`environment.development.ts` с `apiUrl`, убрать хардкод из
      `api.interceptor.ts`
- [ ] Ручной прогон golden path в браузере: регистрация → логин → статья → комментарии →
      favorite → follow → фид

---

## Трек 2 — то же самое на NestJS (`backend/`, скелет уже есть)

Механически повторить функционал трека 1, но Nest-идиоматично:

- [ ] Роутинг → `@Controller`/`@Get`/`@Post` вместо ручных `router.get(...)`
- [ ] `zod`-валидацию → DTO + `class-validator` + глобальный `ValidationPipe`
- [ ] Ручной auth middleware → Passport-JWT `AuthGuard` + `@UseGuards()`
- [ ] Ручной error handler → `ExceptionFilter`
- [ ] Тот же Knex-слой БД (тот же `db.ts`/миграции, что в трек 1 — можно расшарить или
      скопировать) — опционально: попробовать здесь ещё и TypeORM/Prisma, раз это второй проход,
      чтобы заодно сравнить ORM-подходы
- [ ] Swagger (`@nestjs/swagger`) — сгенерировать доку, сверить с `openapi.yml`
- [ ] Тот же набор `hurl`-тестов должен зазеленеть на новом порту
- [ ] Unit + e2e тесты (Jest уже настроен в `backend/package.json`)
- [ ] Переключить Angular `apiUrl` на этот бэкенд и повторно пройти golden path

---

## Трек 3 — Сравнение (для себя, заметками)

- [ ] Сколько кода ушло на каждый слой (роутинг / валидация / auth / ошибки) в каждом треке
- [ ] Что Nest даёт бесплатно: DI-контейнер, декларативная валидация, guards/interceptors как
      переиспользуемые примитивы, готовая тестовая инфраструктура
- [ ] Где Nest усложняет: magic/boilerplate декораторов, сложнее понять "что реально происходит"
      без базы Node из Трека 0

---

## Стретч-цели (опционально, после обоих треков)

- [ ] Кэширование: Redis для `GET /articles`, инвалидация при мутациях
- [ ] Rate limiting на auth-эндпоинтах
- [ ] File upload аватарок (реальный, не просто URL-поле)
- [ ] WebSockets: real-time уведомления о новых комментариях
- [ ] CQRS/EventEmitter: side-effects (например email при новом фолловере)
- [ ] Микросервисы: разбить на `auth-service` + `articles-service` (NATS/Redis transport)
- [ ] GraphQL-версия части API поверх того же домена — сравнить с REST
- [ ] CI: GitHub Actions — lint + test + build для обоих бэкендов
- [ ] Docker Compose: `frontend + backend + postgres + redis`, деплой на Fly.io/Railway/Render
