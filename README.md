# Idle Incremental Full-Stack Game

Полноценный MVP браузерной idle/incremental игры с расширяемой архитектурой:
- Spring Boot backend (JWT + Google OAuth2, JPA, Flyway, H2/PostgreSQL-ready)
- React + TypeScript frontend (компонентный UI, sound/animation/theme слои)

## Технологии
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, H2, Flyway, Lombok, MapStruct, OAuth2 Client, JWT
- Frontend: React, TypeScript, Vite, Zustand, Axios

## Структура проекта
- `backend/` — API, security, game-domain, persistence
- `frontend/` — страницы, компоненты, API client, store, sound/animations/theme

## Запуск backend
```bash
cd backend
mvn spring-boot:run
```

Backend поднимется на `http://localhost:8080`.
postgresql://neondb_owner:npg_Vx3hieE0FZkK@ep-lingering-surf-albswyft.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
## Запуск frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Для локальной разработки используйте `VITE_API_BASE_URL=http://localhost:8080` в `.env.local`.
Для production используйте `VITE_API_BASE_URL=https://mathgame-production-70b3.up.railway.app` (см. `frontend/.env.production`).

Frontend поднимется на `http://localhost:5173`.


## Переменные окружения URL
- Frontend:
  - `VITE_API_BASE_URL` — базовый URL backend API и OAuth login (`http://localhost:8080` локально, `https://mathgame-production-70b3.up.railway.app` в production).
- Backend:
  - `APP_FRONTEND_BASE_URL` — URL frontend для OAuth success redirect/CORS (`http://localhost:5173` локально, `https://math-game-8q8.pages.dev` в production).
  - `APP_BACKEND_BASE_URL` — optional backend base URL (`http://localhost:8080` локально, `https://mathgame-production-70b3.up.railway.app` в production).

## H2 Console
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:idlegame;MODE=PostgreSQL;DB_CLOSE_DELAY=-1`
- user: `sa`, password: пусто

## Переключение на PostgreSQL
1. Поднимите PostgreSQL и создайте БД `idlegame`.
2. Отредактируйте `backend/src/main/resources/application-postgres.yml`.
3. Запускайте backend с профилем:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=postgres
   ```
4. Flyway автоматически применит миграции из `db/migration`.

## Где менять игровой баланс и формулу уровней
- Формула уровней: `backend/src/main/java/com/example/idlegame/service/game/level/QuadraticLevelFormula.java`
- Начальные значения игрока: `AuthService`, `OAuth2LoginSuccessHandler`

## Где менять сундуки и награды
- Конфиг сундуков: `ChestConfiguration`
- Стратегии наград: пакет `service/game/reward`
- Добавление нового типа награды: enum `RewardType` + новая `RewardStrategy`

## Где менять звуки и анимации
- Sound registry: `frontend/src/sound/soundConfig.ts`
- Sound manager: `frontend/src/sound/soundManager.ts`
- Animation registry: `frontend/src/animations/animationConfig.ts`
- CSS-анимации/тема: `frontend/src/theme/styles.css`

## Основные API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/player/profile`
- `GET /api/player/progress`
- `GET /api/chest/list`
- `POST /api/chest/open`
- `POST /api/rewards/daily-claim`
- `GET /api/boost/active`

## Seed/demo
Flyway миграция `V1__init.sql` создает demo-игрока:
- email: `demo@game.local`
- password: `demo123`

## Расширение дальше
- Переносите chest/reward конфиги из Java в БД/JSON.
- Добавляйте новые boost types через `BoostEffect` registry.
- Добавляйте игровые action-модули как отдельные service/domain пакеты.
- Подключайте Lottie/Howler без изменения core game flow, заменяя только animation/sound layer.

## Новый режим: Strategy Mode (MVP)

Добавлен отдельный стратегический режим на роуте ` /strategy ` (доступен после авторизации).

### Как открыть
1. Войдите в аккаунт.
2. Откройте боковое меню и выберите пункт **«Стратегия»**.
3. Либо перейдите через страницу **«Режимы»** → **Strategy Mode (MVP)**.

### Что добавлено
- Отдельная страница стратегического режима с изолированным состоянием.
- Карта 3x3 территорий с соседством, стартовым владением центральной территорией.
- Бой за соседнюю территорию через решение математических задач по таймеру.
- Прогресс захвата, серия ответов, штраф за ошибки.
- Захват территории + награды ресурсами (золото и припасы).
- Лог последних действий, сводка по последнему бою.

### Архитектура Strategy feature
`frontend/src/features/strategy/`:
- `StrategyPage.tsx` — orchestration/экран режима.
- `domain/` — сущности карты, территорий, боёв и extension point типы.
- `services/`:
  - `mathChallenge.ts` — генератор задач (`MathTaskGenerator`).
  - `battleEngine.ts` — расчёт боевой сессии (`BattleEngine`, `DifficultyStrategy`).
  - `rewardCalculator.ts` — расчёт наград (`RewardCalculator`).
- `store/strategyGameStore.ts` — чистые функции состояния режима (создание, выбор территории, старт/тик/ответ в бою, завершение).
- `ui/` — небольшие UI-компоненты (карта, панель боя, ресурсы, лог).
- `config/strategyConfig.ts` — параметры сложности/баланса и константы.

### Точки расширения (заложены в коде)
- `TerritoryType`, `TileEffect` / `TerritoryEffect`
- `BattleMode`, `DifficultyStrategy`
- `MathTaskGenerator`
- `RewardCalculator`
- `Unit`, `Building`, `Ability`

Эти интерфейсы позволяют добавлять новые механики (типы территорий, PvE/PvP, ежедневные события, сезонные модификаторы) без переписывания ядра.
