# Мастер-план: Fullstack Angular (Angular + Node/Express + NestJS)

Это план верхнего уровня. Детальный чеклист по бэкенд-части (Express-трек → Nest-трек →
сравнение) — в [`LEARNING_PLAN.md`](./LEARNING_PLAN.md), сюда он включён кратким блоком (Часть B).

Контекст: Angular (5 лет опыта, точку роста ищем не в Angular, а в бэкенд/интеграционной части)

- готовый RealWorld-фронтенд (`src/`) + контракт API (`realworld/specs/api/openapi.yml`,
  тесты — `realworld/specs/api/hurl/*.hurl`).

---

## Часть A — Angular: закрыть фулстек-смежные пробелы (точечно, не с нуля)

5 лет опыта — базу трогать незачем, фокус на том, что обычно вылезает именно на стыке с бэкендом
и на новых возможностях Angular 21.x (версия уже используемая в этом репо):

- [ ] SSR/Hydration (`@angular/ssr`) — важно, если бэкенд и фронт когда-нибудь деплоятся вместе
- [ ] Signals + zoneless change detection — новая модель реактивности, сверить с тем, как сейчас
      написан `src/app` (RxJS-heavy или уже есть сигналы)
- [ ] `@defer` блоки, image optimization, OnPush-паттерны — performance-слой
- [ ] State management без NgRx (services + signals) vs NgRx/NgXs — когда какой подход оправдан
- [ ] Auth token refresh в interceptor'ах (сейчас `api.interceptor.ts` — простой, без refresh-логики)
- [ ] Component testing глубже (в проекте уже Vitest — гарнессы, testing-library подход)

---

## Часть B — Backend: Node/Express → NestJS (кратко; детали в `LEARNING_PLAN.md`)

- [ ] Трек 0 — Node.js fundamentals (event loop, streams, голый `http`, дебаг)
- [ ] Трек 1 — Express-реализация RealWorld API с нуля (`backend-node/`, Knex, ручные
      middleware/валидация/auth/error-handling)
- [ ] Трек 2 — та же спека на NestJS (`backend/`, уже есть скелет) — DI, декораторы,
      guards/pipes/filters
- [ ] Трек 3 — сравнение подходов (сколько кода на каждый слой, что даёт Nest бесплатно)

---

## Часть C — Fullstack-интеграция (после того как один из бэкендов рабочий)

- [ ] End-to-end auth flow: JWT refresh, обсудить trade-off httpOnly cookie vs localStorage
      (сейчас неясно, как токен хранится на фронте — проверить `src/app/core/auth`)
- [ ] Contract-driven разработка: codegen Angular HTTP-клиента из `openapi.yml`
      (`openapi-typescript` / `ng-openapi-gen`) — вместо ручных моделей в `core/models`
- [ ] `environment.ts`/`environment.development.ts` вместо хардкода в `api.interceptor.ts`,
      единая схема env-переменных на фронте и бэкенде
- [ ] CORS, единый формат ошибок между бэкендами и тем, что ожидает фронт
- [ ] (опционально) Монорепо-тулинг — Nx или просто bun/npm workspaces на 3 пакета
      (`frontend`, `backend-node`, `backend`) вместо трёх независимых `node_modules`

---

## Часть D — DevOps / деплой

- [ ] Docker Compose: `frontend + backend(-node|-nest) + postgres + redis`
- [ ] CI (GitHub Actions): lint + unit + e2e для фронта и обоих бэкендов
- [ ] Healthcheck endpoint, graceful shutdown (`SIGTERM`)
- [ ] Деплой на бесплатный таргет (Fly.io/Railway/Render) — env vars, миграции при деплое

---

## Часть E — Продвинутые фулстек-темы (после того как основной цикл закрыт)

- [ ] Redis-кэш на `GET /articles` + инвалидация при мутациях
- [ ] Rate limiting на auth-эндпоинтах
- [ ] Реальный file upload аватарок (сейчас в спеке — просто URL-строка)
- [ ] WebSockets: real-time уведомления (комментарии/фолловеры) + Angular-клиент к ним
- [ ] Микросервисное разбиение (`auth-service` / `articles-service`, NATS/Redis transport)
- [ ] GraphQL-версия части API поверх того же домена — сравнение REST vs GraphQL с Angular Apollo
- [ ] Observability: сквозной request-id/трейсинг фронт → бэкенд → БД

---

## Как читать эти два файла вместе

1. `FULLSTACK_PLAN.md` (этот файл) — куда движемся в целом, чек-лист по укрупнённым блокам.
2. `LEARNING_PLAN.md` — рабочий трекер конкретно по бэкенд-реализации (Часть B), с
   детализацией по каждому роуту/таблице/тесту.

Начинать имеет смысл с Части B (Track 0 → Track 1), Часть A (Angular) можно вести параллельно
россыпью — по одному пункту, когда наткнёшься на реальный кейс в проекте, а не изолированно.
